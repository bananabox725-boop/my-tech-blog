import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function backup() {
  console.log('Connecting to Redis...');
  const client = createClient({ url: process.env.KV_URL || process.env.REDIS_URL });
  
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('Connected!');

  const posts = await client.get('blog_posts');
  const categories = await client.get('blog_categories');
  const comments = await client.get('blog_comments');

  const backupData = {
    timestamp: new Date().toISOString(),
    posts: posts ? JSON.parse(posts) : [],
    categories: categories ? JSON.parse(categories) : [],
    comments: comments ? JSON.parse(comments) : []
  };

  const backupPath = path.join(__dirname, '../blog_db_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Database backed up successfully to ${backupPath}`);

  await client.quit();
}

backup().catch(console.error);
