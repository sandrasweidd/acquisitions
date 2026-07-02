import fs from 'node:fs';
import dotenv from 'dotenv';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const envPath = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config();
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DATABASE_URL?.includes('neon-local')
) {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
