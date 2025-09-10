create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text not null,
  role text not null default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy profiles_self_read
  on public.profiles for select
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher')
  ));

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid not null references auth.users(id) on delete cascade,
  player2_id uuid references auth.users(id) on delete set null,
  player1_score int not null default 0,
  player2_score int not null default 0,
  status text not null default 'waiting',
  current_question_index int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.games enable row level security;

create policy games_read_own
  on public.games for select to authenticated
  using (
    auth.uid() = player1_id or auth.uid() = player2_id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher')
    )
  );

create table if not exists public.game_questions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  question text not null,
  answer text not null,
  options text[] not null,
  correct_answer text not null,
  answered_by uuid,
  answered_at timestamptz,
  created_at timestamptz default now()
);

alter table public.game_questions enable row level security;

create policy game_questions_read_own
  on public.game_questions for select to authenticated
  using (
    exists (
      select 1 from public.games g where g.id = game_id and (
        g.player1_id = auth.uid() or g.player2_id = auth.uid() or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher')
        )
      )
    )
  );


