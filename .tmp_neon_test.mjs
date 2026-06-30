import { db } from './src/config/database.js';
import { users } from './src/models/user.model.js';
import { eq } from 'drizzle-orm';

console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('DATABASE_URL=', process.env.DATABASE_URL);

(async () => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, 'omarghieh@gmail.com')).limit(1);
    console.log('EXISTING USER QUERY RESULT', JSON.stringify(existingUser, null, 2));
    const insert = await db.insert(users).values({ name: 'test-user', email: `test-${Date.now()}@example.com`, password: 'hash', role: 'user' }).returning({ id: users.id, email: users.email });
    console.log('INSERT RESULT', JSON.stringify(insert, null, 2));
  } catch (e) {
    console.error('ERROR MESSAGE:', e.message);
    console.error('ERROR STACK:', e.stack);
    console.error('ERROR QUERY:', e.query);
    console.error('ERROR PARAMS:', JSON.stringify(e.params));
    console.error('ERROR CAUSE:', JSON.stringify(e.cause, Object.getOwnPropertyNames(e.cause || {}), 2));
    process.exit(1);
  }
})();
