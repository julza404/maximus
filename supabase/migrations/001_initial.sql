-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Topics
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Entries
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cross-references
CREATE TABLE entry_topics (
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, topic_id)
);

-- Reminders (private)
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  note text,
  remind_at timestamptz NOT NULL,
  is_done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Web Push subscriptions (private)
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Auto-update updated_at on entries
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Topics: anyone can read, only auth can write
CREATE POLICY "topics_select_public" ON topics FOR SELECT USING (true);
CREATE POLICY "topics_insert_auth" ON topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "topics_update_auth" ON topics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "topics_delete_auth" ON topics FOR DELETE USING (auth.role() = 'authenticated');

-- Entries: public entries readable by all, private only by auth
CREATE POLICY "entries_select_public" ON entries FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');
CREATE POLICY "entries_insert_auth" ON entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "entries_update_auth" ON entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "entries_delete_auth" ON entries FOR DELETE USING (auth.role() = 'authenticated');

-- Entry topics: readable if entry is public or auth
CREATE POLICY "entry_topics_select" ON entry_topics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM entries e
    WHERE e.id = entry_id AND (e.is_public = true OR auth.role() = 'authenticated')
  )
);
CREATE POLICY "entry_topics_insert_auth" ON entry_topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "entry_topics_delete_auth" ON entry_topics FOR DELETE USING (auth.role() = 'authenticated');

-- Reminders: auth only
CREATE POLICY "reminders_auth" ON reminders USING (auth.role() = 'authenticated');

-- Push subscriptions: auth only
CREATE POLICY "push_subscriptions_auth" ON push_subscriptions USING (auth.role() = 'authenticated');
