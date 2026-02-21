-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE coaching_style AS ENUM ('DIRECT', 'STRATEGIC', 'DRIVEN');
CREATE TYPE habit_type AS ENUM ('GENERIC', 'JOURNAL', 'WORKOUT');
CREATE TYPE anchor_type AS ENUM ('NON_NEGOTIABLE', 'GROWTH', 'ROTATING_FOCUS');
CREATE TYPE log_status AS ENUM ('DONE', 'MISSED', 'SKIPPED', 'PARTIAL');
CREATE TYPE message_role AS ENUM ('USER', 'AI');

-- profiles: one row per user
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_mode_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- onboarding_profiles: onboarding data collected per user
CREATE TABLE onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  ideal_day TEXT,
  goals_week JSONB,
  goals_month JSONB,
  goals_year JSONB,
  goals_5_year JSONB,
  passions TEXT[],
  strengths TEXT[],
  weaknesses TEXT[],
  identity_statement TEXT,
  prior_habits TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ai_personality_profiles: coaching style per user
CREATE TABLE ai_personality_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  coaching_style coaching_style NOT NULL DEFAULT 'DIRECT',
  tone_settings JSONB NOT NULL DEFAULT '{"bluntness": 0.9, "empathy": 0.1, "energy": 0.5}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- habits: user protocols
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type habit_type NOT NULL DEFAULT 'GENERIC',
  category TEXT,
  anchor_type anchor_type NOT NULL,
  schedule JSONB NOT NULL DEFAULT '{"frequency": "daily"}',
  difficulty_level INTEGER NOT NULL DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  recommended_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- habit_logs: daily execution records
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status log_status NOT NULL DEFAULT 'MISSED',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- habit_months: monthly aggregation
CREATE TABLE habit_months (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  month_start_date DATE NOT NULL,
  joined_midmonth_date DATE,
  days JSONB NOT NULL DEFAULT '{}',
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- journals: Signal Log entries
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- workouts: workout logs
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercises JSONB,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- metrics_snapshots: daily computed metrics
CREATE TABLE metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  momentum_score FLOAT NOT NULL DEFAULT 0,
  consistency_rate FLOAT NOT NULL DEFAULT 0,
  recovery_score FLOAT,
  habit_health_scores JSONB,
  raw_inputs JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ai_conversations: chat history
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- recovery_events: recalibration event log (schema ready, not used in MVP)
CREATE TABLE recovery_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_reason TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  actions_taken JSONB
);

-- daily_greetings: cached AI briefings
CREATE TABLE daily_greetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_profiles_updated_at BEFORE UPDATE ON onboarding_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_personality_profiles_updated_at BEFORE UPDATE ON ai_personality_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habit_logs_updated_at BEFORE UPDATE ON habit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(user_id, active);
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);
CREATE INDEX idx_journals_user_date ON journals(user_id, date DESC);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX idx_metrics_snapshots_user_date ON metrics_snapshots(user_id, date DESC);
