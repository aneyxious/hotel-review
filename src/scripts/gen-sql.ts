import fs from 'fs';
import path from 'path';
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
  useful_count: string;
  review_count: string;
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

async function generateSql() {
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
  const sqlDir = path.resolve(process.cwd(), 'scripts', 'sql-batches');
  fs.mkdirSync(sqlDir, { recursive: true });

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = batch.map((row) => {
      const images = parseJsonArray(row.images);
      const categories = parseJsonArray(row.categories);
      const score = parseFloat(row.score);
      const star = Math.max(1, Math.floor(score));

      return `('${escapeSql(row._id)}', '${escapeSql(row.comment)}', '${escapeSql(JSON.stringify(images))}'::jsonb, ${score}, ${star}, '${row.publish_date}', '${escapeSql(row.room_type)}', '${escapeSql(row.fuzzy_room_type)}', '${escapeSql(row.travel_type)}', ${parseInt(row.comment_len, 10)}, ${parseInt(row.useful_count, 10)}, ${parseInt(row.review_count, 10)}, ${parseInt(row.quality_score, 10)}, '${escapeSql(JSON.stringify(categories))}'::jsonb, ${categories[0] ? `'${escapeSql(categories[0])}'` : 'NULL'}, ${categories[1] ? `'${escapeSql(categories[1])}'` : 'NULL'}, ${categories[2] ? `'${escapeSql(categories[2])}'` : 'NULL'})`;
    }).join(',\n');

    const sql = `INSERT INTO comments (_id, comment, images, score, star, publish_date, room_type, fuzzy_room_type, travel_type, comment_len, useful_count, review_count, quality_score, categories, category1, category2, category3) VALUES \n${values}\n ON CONFLICT (_id) DO NOTHING;\n`;

    fs.writeFileSync(path.join(sqlDir, `batch-${String(Math.floor(i / batchSize) + 1).padStart(3, '0')}.sql`), sql);
  }

  console.log(`Generated ${Math.ceil(rows.length / batchSize)} SQL files in ${sqlDir}`);
}

generateSql().catch(console.error);
