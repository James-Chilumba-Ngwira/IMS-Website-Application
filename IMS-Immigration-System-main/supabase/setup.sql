-- =============================================================================
-- IMS Immigration System – Full Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- 1) INSTITUTIONS
create table if not exists public.institutions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  institution_type text not null default 'UNIVERSITY'
                   check (institution_type in ('UNIVERSITY','COLLEGE','LANGUAGE_SCHOOL')),
  address        text,
  contact_email  text,
  contact_phone  text,
  license_number text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) PROFILES  (1-to-1 with auth.users)
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'INSTITUTION'
                      check (role in ('IMMIGRATION','INSTITUTION','STUDENT')),
  institution_id uuid references public.institutions(id),
  -- FK added after public.students is created below (see end of section 3).
  -- Set only for role = 'STUDENT': links a self-service student account to
  -- their own row in public.students.
  student_id     uuid,
  full_name      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3) STUDENTS
create table if not exists public.students (
  id                uuid primary key default gen_random_uuid(),
  institution_id    uuid not null references public.institutions(id),
  student_id_number text not null,
  full_name         text not null,
  nationality       text not null,
  passport_number   text,
  date_of_birth     date not null,
  email             text,
  phone             text,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_student_id_fkey foreign key (student_id) references public.students(id);

-- 4) VISAS
create table if not exists public.visas (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  visa_type   text not null,
  visa_number text,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'ACTIVE'
                   check (status in ('ACTIVE','EXPIRED','CANCELLED','PENDING_RENEWAL')),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 5) ATTENDANCE RECORDS
create table if not exists public.attendance_records (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  attendance_date date not null,
  status          text not null default 'PRESENT'
                       check (status in ('PRESENT','ABSENT','EXCUSED','LATE')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- 6) VERIFICATION REQUESTS
create table if not exists public.verification_requests (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid references public.students(id),
  card_id           uuid,
  institution_id    uuid references public.institutions(id),
  verified_by       uuid references auth.users(id),
  verification_type text,
  result            jsonb,
  reason            text,
  user_agent        text,
  device_id         text,
  client_ip         text,
  created_at        timestamptz not null default now()
);

-- 7) AUDIT LOGS
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id),
  action     text not null,
  table_name text not null,
  record_id  text not null,
  changes    jsonb,
  created_at timestamptz not null default now()
);

-- 8) STUDENT CARDS
create table if not exists public.student_cards (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.students(id) on delete cascade,
  institution_id    uuid not null references public.institutions(id),
  status            text not null default 'ACTIVE'
                         check (status in ('ACTIVE','SUSPENDED','REVOKED','EXPIRED')),
  token_version     int not null default 1,
  record_hash       text,
  blockchain_tx_id  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 9) BLOCKCHAIN LEDGER  (tamper-evidence log)
create table if not exists public.blockchain_ledger (
  id                uuid primary key default gen_random_uuid(),
  card_id           uuid not null references public.student_cards(id) on delete cascade,
  record_hash       text not null,
  blockchain_tx_id  text not null,
  created_at        timestamptz not null default now()
);

-- 10) ANALYTICS SUMMARY  (single-row materialized metrics)
create table if not exists public.analytics_summary (
  id                    uuid primary key default gen_random_uuid(),
  total_students        int not null default 0,
  active_visas          int not null default 0,
  overdue_notifications int not null default 0,
  high_risk_alerts      int not null default 0,
  updated_at            timestamptz not null default now()
);

-- 11) VISA RENEWAL REQUESTS  (student-initiated, institution-reviewed)
create table if not exists public.visa_renewal_requests (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students(id) on delete cascade,
  visa_id             uuid not null references public.visas(id) on delete cascade,
  institution_id      uuid not null references public.institutions(id),
  requested_end_date  date not null,
  reason              text not null,
  status              text not null default 'PENDING'
                           check (status in ('PENDING','APPROVED','REJECTED')),
  reviewed_by         uuid references auth.users(id),
  review_note         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 12) MESSAGES  (two-way student <-> institution thread, one thread per student)
create table if not exists public.messages (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students(id) on delete cascade,
  institution_id uuid not null references public.institutions(id),
  sender_role    text not null check (sender_role in ('STUDENT','INSTITUTION')),
  sender_name    text not null,
  body           text not null,
  read           boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Insert initial analytics row
insert into public.analytics_summary (total_students, active_visas, overdue_notifications, high_risk_alerts)
values (0, 0, 0, 0)
on conflict do nothing;

-- =============================================================================
-- RPC: issue_student_card
-- Creates a student card, blockchain ledger entry, and audit log in one call.
-- =============================================================================
create or replace function public.issue_student_card(p_student_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_student   record;
  v_card_id   uuid;
  v_hash      text;
  v_tx_id     text;
begin
  -- Fetch student + institution
  select s.id, s.full_name, s.institution_id
    into v_student
    from public.students s
   where s.id = p_student_id;

  if not found then
    raise exception 'Student not found';
  end if;

  -- Generate deterministic hash (simple sha256 of student id + timestamp)
  v_hash  := encode(digest(p_student_id::text || now()::text, 'sha256'), 'hex');
  v_tx_id := 'tx_' || substr(v_hash, 1, 16);

  -- Create the card
  insert into public.student_cards (student_id, institution_id, status, token_version, record_hash, blockchain_tx_id)
  values (p_student_id, v_student.institution_id, 'ACTIVE', 1, v_hash, v_tx_id)
  returning id into v_card_id;

  -- Create ledger entry
  insert into public.blockchain_ledger (card_id, record_hash, blockchain_tx_id)
  values (v_card_id, v_hash, v_tx_id);

  -- Audit log
  insert into public.audit_logs (user_id, action, table_name, record_id, changes)
  values (auth.uid(), 'ISSUE_CARD', 'student_cards', v_card_id::text,
          jsonb_build_object('student_id', p_student_id, 'card_id', v_card_id));

  return jsonb_build_object('card_id', v_card_id, 'record_hash', v_hash, 'blockchain_tx_id', v_tx_id);
end;
$$;

-- =============================================================================
-- Enable pgcrypto for digest() used above
-- =============================================================================
create extension if not exists pgcrypto;

-- =============================================================================
-- Row Level Security (RLS) – Enable on all tables
-- Start with permissive policies; tighten as needed.
-- =============================================================================
alter table public.institutions         enable row level security;
alter table public.profiles             enable row level security;
alter table public.students             enable row level security;
alter table public.visas                enable row level security;
alter table public.attendance_records   enable row level security;
alter table public.verification_requests enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.student_cards        enable row level security;
alter table public.blockchain_ledger    enable row level security;
alter table public.analytics_summary    enable row level security;
alter table public.visa_renewal_requests enable row level security;
alter table public.messages             enable row level security;

-- Allow authenticated users full access (adjust for production)
create policy "Authenticated full access" on public.institutions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.profiles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.students
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.visas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.attendance_records
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.verification_requests
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.audit_logs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.student_cards
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.blockchain_ledger
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.analytics_summary
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.visa_renewal_requests
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on public.messages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =============================================================================
-- Done! Your IMS database is ready.
-- =============================================================================
