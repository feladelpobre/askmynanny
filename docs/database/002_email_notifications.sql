-- askmynanny: email notifications
-- Applied to Supabase project ixanhciolnuxgyglcqaa as migration "email_notifications".
--
-- When a verification status changes (or a family sends a message), a trigger calls the
-- "notify" edge function with only {type, id}. The function re-reads the database and
-- decides what to send, and public.notification_log stops duplicates.

create extension if not exists pg_net with schema extensions;

-- One row per email notification already sent. Only the edge function (secret key) uses it.
create table public.notification_log (
  key text primary key check (char_length(key) <= 200),
  created_at timestamptz not null default now()
);
alter table public.notification_log enable row level security;
revoke all on public.notification_log from anon, authenticated;

-- Fire-and-forget call to the notify function. Runs as the table owner so app users
-- don't need access to pg_net; it is not exposed through the API (private schema).
create function private.queue_notification(kind text, entity_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://ixanhciolnuxgyglcqaa.supabase.co/functions/v1/notify',
    body := jsonb_build_object('type', kind, 'id', entity_id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
end $$;
revoke execute on function private.queue_notification(text, uuid) from public, anon, authenticated;

create function private.notify_profile_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status and new.status in ('pending', 'verified', 'rejected') then
    perform private.queue_notification('profile', new.user_id);
  end if;
  return null;
end $$;

create function private.notify_document_rejected() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    perform private.queue_notification('document', new.id);
  end if;
  return null;
end $$;

create function private.notify_contact_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.queue_notification('contact', new.id);
  return null;
end $$;

revoke execute on function private.notify_profile_status() from public, anon, authenticated;
revoke execute on function private.notify_document_rejected() from public, anon, authenticated;
revoke execute on function private.notify_contact_request() from public, anon, authenticated;

create trigger notify_nanny_status after update of status on public.nanny_profiles
  for each row execute function private.notify_profile_status();
create trigger notify_employer_status after update of status on public.employer_profiles
  for each row execute function private.notify_profile_status();
create trigger notify_document_rejected after update of status on public.documents
  for each row execute function private.notify_document_rejected();
create trigger notify_contact_request after insert on public.contact_requests
  for each row execute function private.notify_contact_request();
