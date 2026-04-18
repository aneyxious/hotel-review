export interface Comment {
  id: string;
  _id: string;
  comment: string;
  images: string[];
  score: number;
  star: number;
  publish_date: string;
  room_type: string;
  fuzzy_room_type: string;
  travel_type: string;
  comment_len: number;
  useful_count: number;
  review_count: number;
  quality_score: number;
  categories: string[];
  category1: string | null;
  category2: string | null;
  category3: string | null;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CommentsResponse {
  data: Comment[];
  pagination: PaginationInfo;
}

export interface StatsResponse {
  totalCount: number;
  averageScore: number;
  averageStar: number;
  starDistribution: Record<string, number>;
  roomTypeDistribution: Record<string, number>;
  travelTypeDistribution: Record<string, number>;
}

export interface FilterOptions {
  roomTypes: string[];
  travelTypes: string[];
  categories: Record<string, string[]>;
  scoreRange: { min: number; max: number };
}

export interface FilterState {
  scoreMin?: number;
  scoreMax?: number;
  star?: number;
  roomType?: string;
  travelType?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
