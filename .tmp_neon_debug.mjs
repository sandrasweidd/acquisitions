import fs from 'fs';
import dotenv from 'dotenv';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

dotenv.config();
if (fs.existsSync('.env.development')) {
    dotenv.config({ path: '.env.development', override: true });
}

if (process.env.NODE_ENV === 'development' || process.env.DATABASE_URL?.includes('neon-local')) {
    neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('DATABASE_URL=', process.env.DATABASE_URL);

(async () => {
    try {
        const r = await db.execute(sql`select 1 as ok`);
        console.log('RESULT1', JSON.stringify(r, null, 2));
        const tables = await db.execute(sql`select table_name from information_schema.tables where table_schema = 'public'`);
        console.log('TABLES', JSON.stringify(tables, null, 2));
    } catch (e) {
        console.error('ERROR MESSAGE:', e.message);
        console.error('ERROR STACK:', e.stack);
        console.error('ERROR QUERY:', e.query);
        console.error('ERROR PARAMS:', e.params);
        console.error('ERROR CAUSE:', JSON.stringify(e.cause, Object.getOwnPropertyNames(e.cause || {}), 2));
        process.exit(1);
    }
})();
