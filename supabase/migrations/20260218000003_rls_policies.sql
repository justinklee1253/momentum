-- Row Level Security policies for all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_greetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- onboarding_profiles
CREATE POLICY "Users can manage own onboarding profile" ON onboarding_profiles FOR ALL USING (auth.uid() = user_id);

-- ai_personality_profiles
CREATE POLICY "Users can manage own AI personality" ON ai_personality_profiles FOR ALL USING (auth.uid() = user_id);

-- habits
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- habit_logs
CREATE POLICY "Users can manage own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- habit_months
CREATE POLICY "Users can manage own habit months" ON habit_months FOR ALL USING (auth.uid() = user_id);

-- journals
CREATE POLICY "Users can manage own journals" ON journals FOR ALL USING (auth.uid() = user_id);

-- workouts
CREATE POLICY "Users can manage own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);

-- metrics_snapshots
CREATE POLICY "Users can manage own metrics" ON metrics_snapshots FOR ALL USING (auth.uid() = user_id);

-- ai_conversations
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- recovery_events
CREATE POLICY "Users can manage own recovery events" ON recovery_events FOR ALL USING (auth.uid() = user_id);

-- daily_greetings
CREATE POLICY "Users can manage own daily greetings" ON daily_greetings FOR ALL USING (auth.uid() = user_id);

-- embeddings
CREATE POLICY "Users can manage own embeddings" ON embeddings FOR ALL USING (auth.uid() = user_id);
