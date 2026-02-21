-- Fix: handle_new_user() with explicit search_path and schema-qualified refs.
-- Also re-apply RLS policies idempotently (migration 003 may have failed
-- due to missing embeddings table from pgvector not being enabled).

-- 1. Fix the signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Idempotently create embeddings table (without vector type if pgvector unavailable)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'embeddings') THEN
    CREATE TABLE public.embeddings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL,
      source_id UUID NOT NULL,
      content_preview TEXT,
      embedding TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_embeddings_user_source ON public.embeddings(user_id, source_type);
  END IF;
END
$$;

-- 4. Enable RLS on all tables (idempotent -- enabling twice is a no-op)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_greetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- 5. Re-apply all RLS policies idempotently
DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- onboarding_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='onboarding_profiles' AND policyname='Users can manage own onboarding profile') THEN
    CREATE POLICY "Users can manage own onboarding profile" ON public.onboarding_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- ai_personality_profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_personality_profiles' AND policyname='Users can manage own AI personality') THEN
    CREATE POLICY "Users can manage own AI personality" ON public.ai_personality_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- habits
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='habits' AND policyname='Users can manage own habits') THEN
    CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- habit_logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='habit_logs' AND policyname='Users can manage own habit logs') THEN
    CREATE POLICY "Users can manage own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- habit_months
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='habit_months' AND policyname='Users can manage own habit months') THEN
    CREATE POLICY "Users can manage own habit months" ON public.habit_months FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- journals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='journals' AND policyname='Users can manage own journals') THEN
    CREATE POLICY "Users can manage own journals" ON public.journals FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- workouts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='workouts' AND policyname='Users can manage own workouts') THEN
    CREATE POLICY "Users can manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- metrics_snapshots
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='metrics_snapshots' AND policyname='Users can manage own metrics') THEN
    CREATE POLICY "Users can manage own metrics" ON public.metrics_snapshots FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- ai_conversations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_conversations' AND policyname='Users can manage own conversations') THEN
    CREATE POLICY "Users can manage own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- recovery_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recovery_events' AND policyname='Users can manage own recovery events') THEN
    CREATE POLICY "Users can manage own recovery events" ON public.recovery_events FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- daily_greetings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='daily_greetings' AND policyname='Users can manage own daily greetings') THEN
    CREATE POLICY "Users can manage own daily greetings" ON public.daily_greetings FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- embeddings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='embeddings' AND policyname='Users can manage own embeddings') THEN
    CREATE POLICY "Users can manage own embeddings" ON public.embeddings FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;
