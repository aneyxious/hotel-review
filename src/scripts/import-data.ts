import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface CsvRow {
  _id: string;
  comment: string;
  images: string;
  score: string;
  publish_date: string;
  room_type: string;
  fuzzy_room_type: string;
  travel_type: string;
  comment_len: string;
  log_comment_len: string;
  useful_count: string;
  log_useful_count: string;
  review_count: string;
  log_review_count: string;
  quality_score: string;
  categories: string;
}

function parseJsonArray(str: string): string[] {
  try {
    const cleaned = str.replace(/'/g, '"');
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreToStar(score: number): number {
  return Math.max(1, Math.floor(score));
}

function splitCategories(categories: string[]): { category1: string | null; category2: string | null; category3: string | null } {
  return {
    category1: categories[0] || null,
    category2: categories[1] || null,
    category3: categories[2] || null,
  };
}

async function importData() {
  const csvPath = path.resolve(process.cwd(), 'public', 'enriched_comments.csv');
  const rows: CsvRow[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath, { encoding: 'utf-8' })
      .pipe(csv())
      .on('data', (data: CsvRow) => rows.push(data))
      .on('end', () => resolve())
      .on('error', reject);
  });

  console.log(`Read ${rows.length} rows from CSV`);

  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const records = batch.map((row) => {
      const images = parseJsonArray(row.images);
      const categories = parseJsonArray(row.categories);
      const score = parseFloat(row.score);
      const star = scoreToStar(score);
      const { category1, category2, category3 } = splitCategories(categories);

      return {
        _id: row._id,
        comment: row.comment,
        images,
        score,
        star,
        publish_date: row.publish_date,
        room_type: row.room_type,
        fuzzy_room_type: row.fuzzy_room_type,
        travel_type: row.travel_type,
        comment_len: parseInt(row.comment_len, 10),
        useful_count: parseInt(row.useful_count, 10),
        review_count: parseInt(row.review_count, 10),
        quality_score: parseInt(row.quality_score, 10),
        categories,
        category1,
        category2,
        category3,
      };
    });

    const { error } = await supabase.from('comments').upsert(records, { onConflict: '_id' });

    if (error) {
      console.error(`Batch ${i / batchSize + 1} error:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${records.length} records)`);
    }
  }

  console.log('Import complete!');
}

importData().catch(console.error);
