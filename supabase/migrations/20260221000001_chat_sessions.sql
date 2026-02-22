-- chat_sessions: groups ai_conversations into discrete threads
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_conversations
  ADD COLUMN session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id, created_at ASC);

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions FOR ALL USING (auth.uid() = user_id);
