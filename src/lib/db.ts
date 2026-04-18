import { Pool } from 'pg';
import { Comment, CommentsResponse, StatsResponse, FilterOptions } from '@/types/comment';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

function buildWhereClause(filters: {
  scoreMin?: number;
  scoreMax?: number;
  star?: number;
  roomType?: string;
  travelType?: string;
  category?: string;
  search?: string;
}): { clause: string; values: (string | number)[] } {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIdx = 1;

  if (filters.scoreMin !== undefined) {
    conditions.push(`score >= $${paramIdx++}`);
    values.push(filters.scoreMin);
  }
  if (filters.scoreMax !== undefined) {
    conditions.push(`score <= $${paramIdx++}`);
    values.push(filters.scoreMax);
  }
  if (filters.star !== undefined) {
    conditions.push(`star = $${paramIdx++}`);
    values.push(filters.star);
  }
  if (filters.roomType) {
    conditions.push(`room_type = $${paramIdx++}`);
    values.push(filters.roomType);
  }
  if (filters.travelType) {
    conditions.push(`travel_type = $${paramIdx++}`);
    values.push(filters.travelType);
  }
  if (filters.category) {
    conditions.push(`(category1 = $${paramIdx} OR category2 = $${paramIdx} OR category3 = $${paramIdx})`);
    values.push(filters.category);
    paramIdx++;
  }
  if (filters.search) {
    conditions.push(`comment ILIKE $${paramIdx++}`);
    values.push(`%${filters.search}%`);
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, values };
}

export async function getComments(
  page: number = 1,
  pageSize: number = 20,
  filters: {
    scoreMin?: number;
    scoreMax?: number;
    star?: number;
    roomType?: string;
    travelType?: string;
    category?: string;
    search?: string;
  } = {}
): Promise<CommentsResponse> {
  const { clause, values } = buildWhereClause(filters);
  const offset = (page - 1) * pageSize;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int as total FROM comments ${clause}`,
    values
  );
  const total = countResult.rows[0]?.total || 0;

  const dataResult = await pool.query(
    `SELECT * FROM comments ${clause} ORDER BY publish_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pageSize, offset]
  );

  return {
    data: dataResult.rows.map((item) => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
      categories: Array.isArray(item.categories) ? item.categories : [],
    })) as Comment[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getStats(filters: {
  roomType?: string;
  travelType?: string;
  category?: string;
  search?: string;
} = {}): Promise<StatsResponse> {
  const { clause, values } = buildWhereClause(filters);

  const result = await pool.query(`SELECT * FROM comments ${clause}`, values);
  const rows = result.rows as Comment[];
  const totalCount = rows.length;
  const averageScore = totalCount > 0 ? rows.reduce((sum, r) => sum + (r.score || 0), 0) / totalCount : 0;
  const averageStar = totalCount > 0 ? rows.reduce((sum, r) => sum + (r.star || 0), 0) / totalCount : 0;

  const starDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  const roomTypeDistribution: Record<string, number> = {};
  const travelTypeDistribution: Record<string, number> = {};

  rows.forEach((row) => {
    starDistribution[String(row.star)] = (starDistribution[String(row.star)] || 0) + 1;
    roomTypeDistribution[row.room_type] = (roomTypeDistribution[row.room_type] || 0) + 1;
    travelTypeDistribution[row.travel_type] = (travelTypeDistribution[row.travel_type] || 0) + 1;
  });

  return {
    totalCount,
    averageScore: Math.round(averageScore * 100) / 100,
    averageStar: Math.round(averageStar * 100) / 100,
    starDistribution,
    roomTypeDistribution,
    travelTypeDistribution,
  };
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const [roomResult, travelResult] = await Promise.all([
    pool.query('SELECT DISTINCT room_type FROM comments ORDER BY room_type'),
    pool.query('SELECT DISTINCT travel_type FROM comments ORDER BY travel_type'),
  ]);

  return {
    roomTypes: roomResult.rows.map((r) => r.room_type),
    travelTypes: travelResult.rows.map((r) => r.travel_type),
    categories: {
      '设施类': ['房间设施', '公共设施', '餐饮设施'],
      '服务类': ['前台服务', '客房服务', '退房/入住效率'],
      '位置类': ['交通便利性', '周边配套', '景观/朝向'],
      '价格类': ['性价比', '价格合理性'],
      '体验类': ['整体满意度', '安静程度', '卫生状况'],
    },
    scoreRange: { min: 0.5, max: 5.0 },
  };
}
