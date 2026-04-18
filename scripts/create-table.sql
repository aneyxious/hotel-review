CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  _id text NOT NULL UNIQUE,
  comment text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  score numeric(2,1) NOT NULL,
  star integer NOT NULL,
  publish_date date NOT NULL,
  room_type text NOT NULL,
  fuzzy_room_type text NOT NULL,
  travel_type text NOT NULL,
  comment_len integer NOT NULL,
  useful_count integer DEFAULT 0,
  review_count integer DEFAULT 0,
  quality_score integer DEFAULT 0,
  categories jsonb DEFAULT '[]'::jsonb,
  category1 text,
  category2 text,
  category3 text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_publish_date ON comments(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_comments_score ON comments(score);
CREATE INDEX IF NOT EXISTS idx_comments_star ON comments(star);
CREATE INDEX IF NOT EXISTS idx_comments_room_type ON comments(room_type);
CREATE INDEX IF NOT EXISTS idx_comments_travel_type ON comments(travel_type);
CREATE INDEX IF NOT EXISTS idx_comments_category1 ON comments(category1);
CREATE INDEX IF NOT EXISTS idx_comments_category2 ON comments(category2);
CREATE INDEX IF NOT EXISTS idx_comments_category3 ON comments(category3);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON comments FOR SELECT USING (true);
