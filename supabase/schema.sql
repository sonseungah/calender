-- ============================================================
-- 스케줄링 · Supabase Schema
-- ============================================================

-- 1. 스트리머 테이블
create table if not exists streamers (
  id            uuid primary key default gen_random_uuid(),
  channel_id    text unique not null,   -- 치지직 채널 ID
  name          text not null,
  handle        text unique not null,   -- @handle (소문자, 고유)
  avatar_url    text,
  follower_count int default 0,
  is_verified   boolean default false,
  created_at    timestamptz default now()
);

-- 2. 방송 일정 테이블
create table if not exists events (
  id            uuid primary key default gen_random_uuid(),
  streamer_id   uuid not null references streamers(id) on delete cascade,
  date          date not null,
  start_time    time not null,
  title         text not null,
  category      text not null check (category in ('game','chat','collab','member','off')),
  description   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. 팔로우 테이블 (팬 = Supabase Auth 유저)
create table if not exists follows (
  fan_id        uuid not null references auth.users(id) on delete cascade,
  streamer_id   uuid not null references streamers(id) on delete cascade,
  followed_at   timestamptz default now(),
  primary key (fan_id, streamer_id)
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table streamers enable row level security;
alter table events    enable row level security;
alter table follows   enable row level security;

-- streamers: 누구나 읽기 가능 / 본인만 수정
create policy "streamers_select_all" on streamers for select using (true);
create policy "streamers_insert_own" on streamers for insert
  with check (auth.uid()::text = channel_id);
create policy "streamers_update_own" on streamers for update
  using (auth.uid()::text = channel_id);

-- events: 누구나 읽기 / 스트리머 본인만 쓰기
create policy "events_select_all" on events for select using (true);
create policy "events_insert_own" on events for insert
  with check (
    exists (
      select 1 from streamers s
      where s.id = streamer_id and s.channel_id = auth.uid()::text
    )
  );
create policy "events_update_own" on events for update
  using (
    exists (
      select 1 from streamers s
      where s.id = streamer_id and s.channel_id = auth.uid()::text
    )
  );
create policy "events_delete_own" on events for delete
  using (
    exists (
      select 1 from streamers s
      where s.id = streamer_id and s.channel_id = auth.uid()::text
    )
  );

-- follows: 본인 팔로우만 읽기/쓰기
create policy "follows_select_own" on follows for select using (auth.uid() = fan_id);
create policy "follows_insert_own" on follows for insert with check (auth.uid() = fan_id);
create policy "follows_delete_own" on follows for delete using (auth.uid() = fan_id);

-- ============================================================
-- 인덱스
-- ============================================================
create index if not exists events_streamer_date on events (streamer_id, date);
create index if not exists events_date on events (date);
create index if not exists follows_fan on follows (fan_id);
create index if not exists streamers_handle on streamers (handle);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();
