import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import csv from 'csv-parser';

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

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function scoreToStar(score: number): number {
  return Math.max(1, Math.floor(score));
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

  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const values = batch.map((row) => {
      const images = parseJsonArray(row.images);
      const categories = parseJsonArray(row.categories);
      const score = parseFloat(row.score);
      const star = scoreToStar(score);
      const commentLen = parseInt(row.comment_len, 10);
      const usefulCount = parseInt(row.useful_count, 10);
      const reviewCount = parseInt(row.review_count, 10);
      const qualityScore = parseInt(row.quality_score, 10);

      return `(
        '${escapeSqlString(row._id)}',
        '${escapeSqlString(row.comment)}',
        '${escapeSqlString(JSON.stringify(images))}'::jsonb,
        ${score},
        ${star},
        '${row.publish_date}',
        '${escapeSqlString(row.room_type)}',
        '${escapeSqlString(row.fuzzy_room_type)}',
        '${escapeSqlString(row.travel_type)}',
        ${commentLen},
        ${usefulCount},
        ${reviewCount},
        ${qualityScore},
        '${escapeSqlString(JSON.stringify(categories))}'::jsonb,
        ${categories[0] ? `'${escapeSqlString(categories[0])}'` : 'NULL'},
        ${categories[1] ? `'${escapeSqlString(categories[1])}'` : 'NULL'},
        ${categories[2] ? `'${escapeSqlString(categories[2])}'` : 'NULL'}
      )`;
    }).join(',\n');

    const sql = `
      INSERT INTO comments (_id, comment, images, score, star, publish_date, room_type, fuzzy_room_type, travel_type, comment_len, useful_count, review_count, quality_score, categories, category1, category2, category3)
      VALUES ${values}
      ON CONFLICT (_id) DO NOTHING;
    `;

    try {
      execSync(`npx @insforge/cli db query "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --json`, {
        stdio: 'pipe',
        timeout: 60000,
      });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
    } catch (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, (error as Error).message);
    }
  }

  console.log('Import complete!');
}

importData().catch(console.error);
