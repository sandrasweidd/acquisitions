import dns from 'dns';

console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('DATABASE_URL=', process.env.DATABASE_URL);

try {
  const addr = await dns.promises.lookup('neon-local');
  console.log('DNS lookup:', addr);
} catch (e) {
  console.error('DNS lookup failed:', e.message);
}

try {
  const url = 'http://neon-local:5432/sql';
  console.log('CONNECT URL:', url);
  const fetchFn = globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new Error('global fetch is not available');
  }
  const res = await fetchFn(url, {
    method: 'POST',
    body: JSON.stringify({
      queries: [{ query: 'select 1 as ok', params: [] }],
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('HTTP status:', res.status);
  const text = await res.text();
  console.log('BODY:', text.slice(0, 1000));
} catch (e) {
  console.error('fetch failed:', e.message);
  console.error(e.stack);
}
