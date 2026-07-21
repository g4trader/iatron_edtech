import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';

const environment = readEnvironment();
const app = await buildApp({ environment });
let shuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, 'graceful_shutdown_started');
  await app.close();
  process.exitCode = 0;
};

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ host: environment.HOST, port: environment.PORT });
} catch (error) {
  app.log.fatal(error, 'startup_failed');
  process.exitCode = 1;
}
