import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();
const server = await app.listen(env.PORT);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${env.PORT} sudah dipakai proses lain. Ganti PORT di .env\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

console.log(`\n🚀 Server jalan di http://localhost:${env.PORT}`);
console.log(`📍 Environment: ${env.NODE_ENV}`);
console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health\n`);

async function shutdown() {
  console.log('\n🛑 Shutting down...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
