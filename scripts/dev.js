import { execSync } from 'node:child_process';
import { existsSync, appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

console.log('Starting Acquisition App in Development Mode');
console.log('================================================');

const envPath = path.join(cwd, '.env.development');
if (!existsSync(envPath)) {
    console.error('X Error: .env.development file not found!');
    console.error('Please copy .env.development from the template and update with your Neon credentials.');
    process.exit(1);
}

try {
    execSync('docker info', { stdio: 'ignore' });
} catch (error) {
    console.error('X Error: Docker is not running!');
    console.error('Please start Docker Desktop and try again.');
    process.exit(1);
}

const neonDir = path.join(cwd, '.neon_local');
if (!existsSync(neonDir)) {
    execSync(`mkdir ${process.platform === 'win32' ? '' : '-p'} .neon_local`, { stdio: 'ignore' });
}

const gitignorePath = path.join(cwd, '.gitignore');
const gitignoreContents = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf8') : '';
if (!gitignoreContents.includes('.neon_local/')) {
    appendFileSync(gitignorePath, `${gitignoreContents.endsWith('\n') || gitignoreContents.length === 0 ? '' : '\n'}.neon_local/\n`);
    console.log('Added .neon_local/ to .gitignore');
}

console.log('Building and starting development containers ...');
console.log('- Neon Local proxy will create an ephemeral database branch');
console.log('- Application will run with hot reload enabled');
console.log('');

console.log('■ Applying latest schema with Drizzle ...');
execSync('npm run db:migrate', { stdio: 'inherit' });

console.log('Waiting for the database to be ready ...');
execSync('docker compose -f docker-compose.dev.yml up --build', { stdio: 'inherit' });

console.log('');
console.log('Development environment started!');
console.log('Application: http://localhost:5173');
console.log('Database: postgres://neon:npg@localhost:5432/neondb');
console.log('');
console.log('To stop the environment, press Ctrl+C or run: docker compose down');
