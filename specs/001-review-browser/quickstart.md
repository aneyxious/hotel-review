# Quick Start: 酒店评论浏览网页

## 环境要求

- Node.js 18+
- Insforge 项目已创建并配置
- Insforge MCP / Skill 已配置

## 项目初始化

### 1. 创建 Next.js 项目

```bash
npx create-next-app@latest hotel-review-browser --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd hotel-review-browser
```

### 2. 安装依赖

```bash
npm install @insforge/sdk @insforge/auth-ui lucide-react
npm install -D @types/node
```

### 3. 配置 Insforge

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_INSFORGE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

### 4. 初始化 Insforge 客户端

创建 `src/lib/insforge.ts`：

```typescript
import { createClient } from '@insforge/sdk'

export const insforge = createClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
)
```

## 数据库初始化

### 创建 comments 表

通过 Insforge SQL Editor 或 Migration 执行：

```sql
CREATE TABLE comments (
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
  log_useful_count numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  log_review_count numeric DEFAULT 0,
  quality_score integer DEFAULT 0,
  categories jsonb DEFAULT '[]'::jsonb,
  category1 text,
  category2 text,
  category3 text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comments_publish_date ON comments(publish_date DESC);
CREATE INDEX idx_comments_score ON comments(score);
CREATE INDEX idx_comments_star ON comments(star);
CREATE INDEX idx_comments_room_type ON comments(room_type);
CREATE INDEX idx_comments_travel_type ON comments(travel_type);
CREATE INDEX idx_comments_category1 ON comments(category1);
CREATE INDEX idx_comments_category2 ON comments(category2);
CREATE INDEX idx_comments_category3 ON comments(category3);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON comments FOR SELECT USING (true);
```

### 数据导入

运行数据导入脚本（见 scripts/import-data.py）：

```bash
python scripts/import-data.py public/enriched_comments.csv
```

## 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可浏览评论。

## 项目结构

```
hotel-review-browser/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── comments/
│   │   │   │   ├── route.ts
│   │   │   │   └── stats/route.ts
│   │   │   └── filters/route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── CommentCard.tsx
│   │   ├── CommentList.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ImageViewer.tsx
│   │   ├── SearchBar.tsx
│   │   └── StatsPanel.tsx
│   ├── lib/
│   │   └── insforge.ts
│   └── types/
│       └── comment.ts
├── public/
│   └── enriched_comments.csv
├── scripts/
│   └── import-data.py
└── package.json
```
