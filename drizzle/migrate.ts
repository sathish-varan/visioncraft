import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  console.log('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');
}

runMigration().catch(console.error);