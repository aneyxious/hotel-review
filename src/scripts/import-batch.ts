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

function escapeSql(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function buildInsertSql(batch: CsvRow[]): string {
  const values = batch.map((row) => {
    const images = parseJsonArray(row.images);
    const categories = parseJsonArray(row.categories);
    const score = parseFloat(row.score);
    const star = Math.max(1, Math.floor(score));

    return `(
      '${escapeSql(row._id)}',
      '${escapeSql(row.comment)}',
      '${escapeSql(JSON.stringify(images))}'::jsonb,
      ${score},
      ${star},
      '${row.publish_date}',
      '${escapeSql(row.room_type)}',
      '${escapeSql(row.fuzzy_room_type)}',
      '${escapeSql(row.travel_type)}',
      ${parseInt(row.comment_len, 10)},
      ${parseInt(row.useful_count, 10)},
      ${parseInt(row.review_count, 10)},
      ${parseInt(row.quality_score, 10)},
      '${escapeSql(JSON.stringify(categories))}'::jsonb,
      ${categories[0] ? `'${escapeSql(categories[0])}'` : 'NULL'},
      ${categories[1] ? `'${escapeSql(categories[1])}'` : 'NULL'},
      ${categories[2] ? `'${escapeSql(categories[2])}'` : 'NULL'}
    )`;
  }).join(',');

  return `INSERT INTO comments (_id, comment, images, score, star, publish_date, room_type, fuzzy_room_type, travel_type, comment_len, useful_count, review_count, quality_score, categories, category1, category2, category3) VALUES ${values} ON CONFLICT (_id) DO NOTHING;`;
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

  const batchSize = 30;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const sql = buildInsertSql(batch);

    try {
      execSync(
        `npx @insforge/cli db query "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --json`,
        { stdio: 'pipe', timeout: 120000 }
      );
      successCount += batch.length;
      console.log(`✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}: ${batch.length} rows`);
    } catch (error) {
      failCount += batch.length;
      console.error(`✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, (error as Error).message.slice(0, 200));
    }
  }

  console.log(`\nImport complete! Success: ${successCount}, Failed: ${failCount}`);
}

importData().catch(console.error);
