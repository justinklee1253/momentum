-- Momentum Score computation function
CREATE OR REPLACE FUNCTION compute_momentum_score(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_window INTEGER DEFAULT 21,
  p_alpha FLOAT DEFAULT 0.18
) RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 0;
  v_total_weight FLOAT := 0;
  v_weighted_sum FLOAT := 0;
  v_record RECORD;
  v_i INTEGER := 0;
  v_weight FLOAT;
  v_status_value FLOAT;
BEGIN
  FOR v_record IN
    SELECT hl.date, hl.status
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE hl.user_id = p_user_id
      AND h.anchor_type = 'NON_NEGOTIABLE'
      AND h.active = TRUE
      AND hl.date <= p_date
      AND hl.date > p_date - p_window
    ORDER BY hl.date DESC
  LOOP
    v_weight := p_alpha * POWER(1 - p_alpha, v_i);
    v_status_value := CASE v_record.status
      WHEN 'DONE' THEN 1.0
      WHEN 'PARTIAL' THEN 0.5
      WHEN 'SKIPPED' THEN 0.2
      ELSE 0.0
    END;
    v_weighted_sum := v_weighted_sum + (v_weight * v_status_value);
    v_total_weight := v_total_weight + v_weight;
    v_i := v_i + 1;
  END LOOP;

  IF v_total_weight > 0 THEN
    v_score := ROUND((v_weighted_sum / v_total_weight) * 100);
  END IF;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Consistency Rate computation function
CREATE OR REPLACE FUNCTION compute_consistency_rate(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_period INTEGER DEFAULT 30
) RETURNS NUMERIC AS $$
DECLARE
  v_earned FLOAT := 0;
  v_expected INTEGER := 0;
  v_record RECORD;
BEGIN
  FOR v_record IN
    SELECT hl.status
    FROM habit_logs hl
    JOIN habits h ON h.id = hl.habit_id
    WHERE hl.user_id = p_user_id
      AND h.anchor_type = 'NON_NEGOTIABLE'
      AND h.active = TRUE
      AND hl.date <= p_date
      AND hl.date > p_date - p_period
  LOOP
    v_expected := v_expected + 1;
    IF v_record.status = 'DONE' THEN
      v_earned := v_earned + 1;
    ELSIF v_record.status = 'PARTIAL' THEN
      v_earned := v_earned + 0.5;
    END IF;
  END LOOP;

  IF v_expected = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((v_earned / v_expected) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nightly batch: compute and snapshot metrics for all users
CREATE OR REPLACE FUNCTION compute_all_metrics_nightly()
RETURNS VOID AS $$
DECLARE
  v_user RECORD;
  v_score NUMERIC;
  v_rate NUMERIC;
BEGIN
  FOR v_user IN SELECT id FROM profiles LOOP
    v_score := compute_momentum_score(v_user.id, CURRENT_DATE);
    v_rate := compute_consistency_rate(v_user.id, CURRENT_DATE);

    INSERT INTO metrics_snapshots (user_id, date, momentum_score, consistency_rate)
    VALUES (v_user.id, CURRENT_DATE, v_score, v_rate)
    ON CONFLICT (user_id, date) DO UPDATE
      SET momentum_score = EXCLUDED.momentum_score,
          consistency_rate = EXCLUDED.consistency_rate;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
