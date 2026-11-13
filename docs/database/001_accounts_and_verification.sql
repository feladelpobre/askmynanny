-- askmynanny: accounts, roles and verification
-- Applied to Supabase project ixanhciolnuxgyglcqaa as migration "accounts_and_verification".
-- Kept here (not in supabase/migrations/) because Lovable manages that folder.
--
-- Roles
--   nanny / employer : chosen at sign-up, stored in public.profiles.account_type (not editable)
--   admin            : set only in auth.users.raw_app_meta_data -> {"role":"admin"} (users can't edit it)
--
-- Verification flow
--   1. User uploads documents (private bucket "verification", own folder only).
--   2. User submits for review (status draft/rejected -> pending). Required uploads are checked.
--   3. Admin approves documents and the profile (status -> verified).
--   4. Only verified nannies are public, and only verified employers can contact verified nannies.

-- 0. Security advisor fix: the RLS auto-enable event-trigger function must not be callable over the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 1. Types ------------------------------------------------------------------
create type public.account_type as enum ('nanny', 'employer');
create type public.review_status as enum ('draft', 'pending', 'verified', 'rejected');
create type public.document_kind as enum (
  'profile_photo', 'id_live_photo', 'government_id',
  'nbi_clearance', 'police_clearance', 'barangay_clearance',
  'tesda_certificate', 'first_aid_certificate', 'medical_certificate', 'other_certificate'
);
create type public.document_status as enum ('pending', 'approved', 'rejected');

-- 2. Helpers (private schema: not exposed through the Data API) ---------------
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create function private.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- 3. Tables -------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type public.account_type not null,
  full_name text not null default '' check (char_length(full_name) <= 120),
  mobile text check (mobile is null or mobile ~ '^\+?[0-9 ()-]{7,20}$'),
  city text check (city is null or char_length(city) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nanny_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  city text check (city is null or char_length(city) <= 60),
  about text check (about is null or char_length(about) <= 1500),
  education text check (education is null or char_length(education) <= 120),
  years_experience int check (years_experience between 0 and 60),
  expected_salary_php int check (expected_salary_php between 0 and 200000),
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  child_age_groups text[] not null default '{}',
  arrangement text check (arrangement in ('live_in', 'live_out', 'either')),
  rest_day text check (rest_day is null or char_length(rest_day) <= 20),
  available_from date,
  status public.review_status not null default 'draft',
  badges text[] not null default '{}',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nanny_private (
  user_id uuid primary key references public.nanny_profiles (user_id) on delete cascade,
  emergency_contact_name text check (emergency_contact_name is null or char_length(emergency_contact_name) <= 120),
  emergency_contact_phone text check (emergency_contact_phone is null or emergency_contact_phone ~ '^\+?[0-9 ()-]{7,20}$'),
  adult_confirmed boolean not null default false,
  privacy_consent_at timestamptz
);

create table public.employer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  city text check (city is null or char_length(city) <= 60),
  household text check (household is null or char_length(household) <= 1000),
  duties text check (duties is null or char_length(duties) <= 1000),
  arrangement text check (arrangement in ('live_in', 'live_out', 'either')),
  offered_salary_php int check (offered_salary_php between 0 and 200000),
  benefits text[] not null default '{}',
  status public.review_status not null default 'draft',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_history (
  id uuid primary key default gen_random_uuid(),
  nanny_id uuid not null references public.nanny_profiles (user_id) on delete cascade,
  employer_name text not null check (char_length(employer_name) between 1 and 120),
  city text check (city is null or char_length(city) <= 60),
  started_on date,
  ended_on date,
  salary_php int check (salary_php between 0 and 200000),
  benefits text[] not null default '{}',
  leave_reason text check (leave_reason is null or char_length(leave_reason) <= 300),
  rating smallint check (rating between 1 and 5),
  review text check (review is null or char_length(review) <= 1000),
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  check (ended_on is null or started_on is null or ended_on >= started_on)
);

-- Past employer's contact, kept out of the public work_history table.
create table public.work_history_contacts (
  work_history_id uuid primary key references public.work_history (id) on delete cascade,
  nanny_id uuid not null references public.nanny_profiles (user_id) on delete cascade,
  contact text not null check (char_length(contact) between 3 and 200)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind public.document_kind not null,
  storage_path text not null check (char_length(storage_path) <= 300),
  status public.document_status not null default 'pending',
  expires_on date,
  review_note text check (review_note is null or char_length(review_note) <= 500),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_profiles (user_id) on delete cascade,
  nanny_id uuid not null references public.nanny_profiles (user_id) on delete cascade,
  message text not null check (char_length(message) between 1 and 1000),
  status text not null default 'sent' check (status in ('sent', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index on public.work_history (nanny_id);
create index on public.work_history_contacts (nanny_id);
create index on public.documents (owner_id);
create index on public.documents (reviewed_by);
create index on public.contact_requests (employer_id);
create index on public.contact_requests (nanny_id);

alter table public.profiles enable row level security;
alter table public.nanny_profiles enable row level security;
alter table public.nanny_private enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.work_history enable row level security;
alter table public.work_history_contacts enable row level security;
alter table public.documents enable row level security;
alter table public.contact_requests enable row level security;

-- 4. Rules enforced in the database (triggers) -------------------------------
create function private.has_required_documents(uid uuid, required public.document_kind[]) returns boolean
language sql stable set search_path = '' as $$
  select not exists (
    select unnest(required)
    except
    select d.kind from public.documents d where d.owner_id = uid and d.status <> 'rejected'
  )
$$;

-- Nannies can edit their profile and submit it for review, but only admins verify or grant badges.
-- Editing a verified profile sends it back to review.
create function private.guard_nanny_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
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
create trigger guard_nanny_profile before update on public.nanny_profiles
  for each row execute function private.guard_nanny_profile();

create function private.guard_employer_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if private.is_admin() then
    if new.status = 'verified' and old.status is distinct from 'verified' then new.verified_at := now(); end if;
    if new.status <> 'verified' then new.verified_at := null; end if;
    return new;
  end if;
  new.verified_at := old.verified_at;
  if new.status is distinct from old.status then
    if not (old.status in ('draft', 'rejected') and new.status = 'pending') then
      raise exception 'Only an admin can change the verification status';
    end if;
    if not private.has_required_documents(new.user_id, array['id_live_photo', 'government_id']::public.document_kind[]) then
      raise exception 'Upload a live photo holding your ID and your government ID before submitting';
    end if;
  end if;
  return new;
end $$;
create trigger guard_employer_profile before update on public.employer_profiles
  for each row execute function private.guard_employer_profile();

-- Ratings, reviews and "confirmed" come from past employers via admins, never from the nanny.
create function private.guard_work_history() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.rating := null; new.review := null; new.confirmed := false;
  else
    new.rating := old.rating; new.review := old.review;
    if (new.employer_name, new.city, new.started_on, new.ended_on, new.salary_php, new.benefits, new.leave_reason)
       is distinct from (old.employer_name, old.city, old.started_on, old.ended_on, old.salary_php, old.benefits, old.leave_reason) then
      new.confirmed := false;
    else
      new.confirmed := old.confirmed;
    end if;
  end if;
  return new;
end $$;
create trigger guard_work_history before insert or update on public.work_history
  for each row execute function private.guard_work_history();

create function private.stamp_document_review() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  end if;
  return new;
end $$;
create trigger stamp_document_review before update on public.documents
  for each row execute function private.stamp_document_review();

-- Approved, unexpired clearances and certificates become public badges on the nanny's profile.
create function private.sync_badges() returns trigger
language plpgsql set search_path = '' as $$
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
   where d.owner_id = new.owner_id
     and d.status = 'approved'
     and (d.expires_on is null or d.expires_on >= current_date)
     and d.kind in ('nbi_clearance', 'police_clearance', 'barangay_clearance',
                    'tesda_certificate', 'first_aid_certificate', 'medical_certificate');
  update public.nanny_profiles set badges = b where user_id = new.owner_id;
  return null;
end $$;
create trigger sync_badges after update of status, expires_on on public.documents
  for each row execute function private.sync_badges();

-- New sign-up: create the profile rows for the chosen account type.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  t public.account_type;
  n text := left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120);
begin
  t := case new.raw_user_meta_data ->> 'account_type'
         when 'nanny' then 'nanny'::public.account_type
         else 'employer'::public.account_type
       end;
  insert into public.profiles (id, account_type, full_name) values (new.id, t, n);
  if t = 'nanny' then
    insert into public.nanny_profiles (user_id, display_name) values (new.id, n);
    insert into public.nanny_private (user_id) values (new.id);
  else
    insert into public.employer_profiles (user_id) values (new.id);
  end if;
  return new;
end $$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- 5. Access rules (RLS) -------------------------------------------------------
-- profiles: own row or admin; only name, mobile and city are editable.
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- nanny_profiles: verified profiles are public.
create policy "nanny_profiles: public reads verified" on public.nanny_profiles for select to anon, authenticated
  using (status = 'verified' or user_id = (select auth.uid()) or private.is_admin());
create policy "nanny_profiles: update own or admin" on public.nanny_profiles for update to authenticated
  using (user_id = (select auth.uid()) or private.is_admin())
  with check (user_id = (select auth.uid()) or private.is_admin());

create policy "nanny_private: own or admin" on public.nanny_private for all to authenticated
  using (user_id = (select auth.uid()) or private.is_admin())
  with check (user_id = (select auth.uid()) or private.is_admin());

create policy "employer_profiles: read own or admin" on public.employer_profiles for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());
create policy "employer_profiles: update own or admin" on public.employer_profiles for update to authenticated
  using (user_id = (select auth.uid()) or private.is_admin())
  with check (user_id = (select auth.uid()) or private.is_admin());

create policy "work_history: public reads verified nannies" on public.work_history for select to anon, authenticated
  using (
    nanny_id = (select auth.uid()) or private.is_admin()
    or exists (select 1 from public.nanny_profiles n where n.user_id = work_history.nanny_id and n.status = 'verified')
  );
create policy "work_history: owner inserts" on public.work_history for insert to authenticated
  with check (nanny_id = (select auth.uid()) or private.is_admin());
create policy "work_history: owner updates" on public.work_history for update to authenticated
  using (nanny_id = (select auth.uid()) or private.is_admin())
  with check (nanny_id = (select auth.uid()) or private.is_admin());
create policy "work_history: owner deletes" on public.work_history for delete to authenticated
  using (nanny_id = (select auth.uid()) or private.is_admin());

create policy "work_history_contacts: own or admin" on public.work_history_contacts for all to authenticated
  using (nanny_id = (select auth.uid()) or private.is_admin())
  with check (nanny_id = (select auth.uid()) or private.is_admin());

-- documents: owners upload into their own folder as "pending"; only admins review.
create policy "documents: read own or admin" on public.documents for select to authenticated
  using (owner_id = (select auth.uid()) or private.is_admin());
create policy "documents: owner uploads" on public.documents for insert to authenticated
  with check (
    owner_id = (select auth.uid()) and status = 'pending' and reviewed_by is null
    and storage_path like (select auth.uid())::text || '/%'
  );
create policy "documents: admin reviews" on public.documents for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "documents: owner deletes pending" on public.documents for delete to authenticated
  using ((owner_id = (select auth.uid()) and status = 'pending') or private.is_admin());

-- contact_requests: only a verified employer can contact a verified nanny.
create policy "contact_requests: verified employer to verified nanny" on public.contact_requests for insert to authenticated
  with check (
    employer_id = (select auth.uid())
    and status = 'sent'
    and exists (select 1 from public.employer_profiles e where e.user_id = (select auth.uid()) and e.status = 'verified')
    and exists (select 1 from public.nanny_profiles n where n.user_id = contact_requests.nanny_id and n.status = 'verified')
  );
create policy "contact_requests: participants read" on public.contact_requests for select to authenticated
  using (employer_id = (select auth.uid()) or nanny_id = (select auth.uid()) or private.is_admin());
create policy "contact_requests: nanny replies" on public.contact_requests for update to authenticated
  using (nanny_id = (select auth.uid())) with check (nanny_id = (select auth.uid()));

-- 6. Grants (column-level where users may only change some fields) ----------
-- Start from nothing, then grant only what each role needs.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.nanny_profiles, public.work_history to anon;
grant select on all tables in schema public to authenticated;
grant insert, delete on public.work_history, public.work_history_contacts, public.documents to authenticated;
grant insert on public.contact_requests to authenticated;
grant insert, update on public.nanny_private to authenticated;
grant update on public.nanny_profiles, public.employer_profiles, public.work_history,
  public.work_history_contacts, public.documents to authenticated;
grant update (full_name, mobile, city) on public.profiles to authenticated;
grant update (status) on public.contact_requests to authenticated;

-- 7. Storage --------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('verification', 'verification', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "verification: upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'verification' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "verification: read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'verification' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));
create policy "verification: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'verification' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "profile-photos: upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile-photos: read own" on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile-photos: replace own" on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile-photos: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
