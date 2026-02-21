-- protocol intent + target settings on habits
CREATE TYPE protocol_intent AS ENUM ('BUILD', 'QUIT');

ALTER TABLE habits
  ADD COLUMN intent protocol_intent NOT NULL DEFAULT 'BUILD',
  ADD COLUMN target_value INTEGER NOT NULL DEFAULT 1 CHECK (target_value > 0),
  ADD COLUMN target_unit TEXT NOT NULL DEFAULT 'count';

ALTER TABLE habits
  ADD CONSTRAINT habits_target_unit_check
  CHECK (
    char_length(target_unit) BETWEEN 2 AND 16
    AND target_unit ~ '^[a-z_]+$'
  );
