# Data Model: 酒店评论浏览系统

## Entity: comments

Insforge PostgreSQL 数据表定义。

### 表结构

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| _id | text | NOT NULL, UNIQUE | 原始 CSV 中的评论 ID |
| comment | text | NOT NULL | 评论文本 |
| images | jsonb | DEFAULT '[]'::jsonb | 图片 URL 数组 |
| score | numeric(2,1) | NOT NULL | 原始评分 (0.5-5.0) |
| star | integer | NOT NULL | 整数评分 (1-5)，由 score 映射 |
| publish_date | date | NOT NULL | 发布日期 |
| room_type | text | NOT NULL | 房型 |
| fuzzy_room_type | text | NOT NULL | 模糊房型 |
| travel_type | text | NOT NULL | 出行类型 |
| comment_len | integer | NOT NULL | 评论长度 |
| useful_count | integer | DEFAULT 0 | 有用数 |
| review_count | integer | DEFAULT 0 | 用户评论数 |
| quality_score | integer | DEFAULT 0 | 质量分 |
| categories | jsonb | DEFAULT '[]'::jsonb | 原始分类标签数组 |
| category1 | text | | 第一个分类标签（小类） |
| category2 | text | | 第二个分类标签（小类） |
| category3 | text | | 第三个分类标签（小类） |
| created_at | timestamptz | DEFAULT now() | 记录创建时间 |

### 字段映射规则

**score → star 映射规则**:
- score < 1.0 → star = 1
- 1.0 ≤ score < 2.0 → star = 1
- 2.0 ≤ score < 3.0 → star = 2
- 3.0 ≤ score < 4.0 → star = 3
- 4.0 ≤ score < 5.0 → star = 4
- score ≥ 5.0 → star = 5

实际上：取 score 的整数位，最小为 1。即 `star = GREATEST(1, FLOOR(score))`

**categories → category1/2/3 拆分规则**:
- 将 categories 数组中的元素按顺序分别存入 category1、category2、category3
- 若 categories 数组长度不足 3，则剩余字段为 NULL
- 若超过 3 个，则只取前 3 个

**分类体系对照**:

| 大类 | 小类 |
|------|------|
| 设施类 | 房间设施、公共设施、餐饮设施 |
| 服务类 | 前台服务、客房服务、退房/入住效率 |
| 位置类 | 交通便利性、周边配套、景观/朝向 |
| 价格类 | 性价比、价格合理性 |
| 体验类 | 整体满意度、安静程度、卫生状况 |

### 索引设计

```sql
CREATE INDEX idx_comments_publish_date ON comments(publish_date DESC);
CREATE INDEX idx_comments_score ON comments(score);
CREATE INDEX idx_comments_star ON comments(star);
CREATE INDEX idx_comments_room_type ON comments(room_type);
CREATE INDEX idx_comments_travel_type ON comments(travel_type);
CREATE INDEX idx_comments_category1 ON comments(category1);
CREATE INDEX idx_comments_category2 ON comments(category2);
CREATE INDEX idx_comments_category3 ON comments(category3);
CREATE INDEX idx_comments_comment_search ON comments USING gin(to_tsvector('chinese', comment));
```

### RLS 策略

由于评论浏览功能无需用户认证，该表不启用 RLS（或开放匿名读取）。

```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read" ON comments FOR SELECT USING (true);
```

### 数据导入脚本

使用 Insforge Edge Function 或 Python 脚本导入：

1. 读取 `public/enriched_comments.csv`
2. 解析每行数据，将 `images` 和 `categories` 从字符串解析为 JSON 数组
3. 计算 `star` 字段
4. 拆分 `categories` 到 `category1/2/3`
5. 批量插入到 Insforge `comments` 表
