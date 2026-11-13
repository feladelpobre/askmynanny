-- askmynanny: document expiry (badges and reminder emails)
-- Applied to Supabase project ixanhciolnuxgyglcqaa as migration "document_expiry".
--
-- Medical certificates and police, barangay and NBI clearances are optional on askmynanny
-- (the hiring employer may require them under RA 10361 Sec. 12). When a nanny uploads one,
-- she enters its "valid until" date. Every day at 00:05 Philippine time:
--   * badges of approved documents past their "valid until" date are removed;
--   * the nanny is emailed 4 weeks (28 days) before that date, and again once it has passed.
-- The notify edge function decides what to send and records each email, so it goes out once.

create extension if not exists pg_cron;

-- Recompute one nanny's public badges from her approved, unexpired documents (Philippine date).
-- Security definer so it can run from the daily job, which has no signed-in admin.
create function private.refresh_badges(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare b text[];
begin
  select coalesce(array_agg(distinct case d.kind
           when 'nbi_clearance' then 'nbi_cleared'
           when 'police_clearance' then 'police_cleared'
           when 'barangay_clearance' then 'barangay_cleared'
           when 'tesda_certificate' then 'tesda_certified'
           when 'first_aid_certificate' then 'first_aid_certified'
           when 'medical_certificate' then 'medically_fit'
         end), '{}')
    into b
    from public.documents d
   where d.owner_id = uid
     and d.status = 'approved'
     and (d.expires_on is null or d.expires_on >= (now() at time zone 'Asia/Manila')::date)
     and d.kind in ('nbi_clearance', 'police_clearance', 'barangay_clearance',
                    'tesda_certificate', 'first_aid_certificate', 'medical_certificate');
  update public.nanny_profiles set badges = b where user_id = uid and badges is distinct from b;
end $$;
revoke execute on function private.refresh_badges(uuid) from public, anon, authenticated;

-- The existing trigger now uses the same function, so there is one badge rule.
create or replace function private.sync_badges() returns trigger
language plpgsql set search_path = '' as $$
begin
  perform private.refresh_badges(new.owner_id);
  return null;
end $$;

-- Same guard as before, plus: trusted backend roles (the daily job, the edge functions) may
-- update badges. App users always run as "anon" or "authenticated" and stay fully guarded.
create or replace function private.guard_nanny_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if private.is_admin() then
    if new.status = 'verified' and old.status is distinct from 'verified' then new.verified_at := now(); end if;
    if new.status <> 'verified' then new.verified_at := null; end if;
    return new;
  end if;
  new.badges := old.badges;
  new.verified_at := old.verified_at;
  if new.status is distinct from old.status then
    if not (old.status in ('draft', 'rejected') and new.status = 'pending') then
      raise exception 'Only an admin can change the verification status';
    end if;
    if not private.has_required_documents(new.user_id, array['profile_photo', 'id_live_photo', 'government_id']::public.document_kind[]) then
      raise exception 'Upload a profile photo, a live photo holding your ID, and your government ID before submitting';
    end if;
    if not exists (select 1 from public.nanny_private p
                   where p.user_id = new.user_id and p.adult_confirmed and p.privacy_consent_at is not null) then
      raise exception 'Confirm you are 18 or older and accept the privacy notice before submitting';
    end if;
  elsif old.status = 'verified' and (new.display_name, new.photo_path, new.city, new.about, new.education,
        new.years_experience, new.expected_salary_php, new.skills, new.languages, new.child_age_groups,
        new.arrangement, new.rest_day, new.available_from)
        is distinct from (old.display_name, old.photo_path, old.city, old.about, old.education,
        old.years_experience, old.expected_salary_php, old.skills, old.languages, old.child_age_groups,
        old.arrangement, old.rest_day, old.available_from) then
    new.status := 'pending';
    new.verified_at := null;
  end if;
  return new;
end $$;

-- The daily job.
create function private.daily_document_expiry() returns void
language plpgsql security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  r record;
begin
  -- 1. Remove badges whose document has expired.
  for r in select distinct d.owner_id from public.documents d
            where d.status = 'approved' and d.expires_on < today loop
    perform private.refresh_badges(r.owner_id);
  end loop;
  -- 2. Ask the notify function to email reminders (4 weeks ahead) and expiry notices
  --    (up to a week after, in case a day was missed). It sends each one only once.
  for r in select d.id from public.documents d
            where d.status = 'approved'
              and d.expires_on between today - 7 and today + 28 loop
    perform private.queue_notification('expiry', r.id);
  end loop;
end $$;
revoke execute on function private.daily_document_expiry() from public, anon, authenticated;

-- 16:05 UTC = 00:05 in the Philippines.
select cron.schedule('document-expiry-daily', '5 16 * * *', 'select private.daily_document_expiry()');
