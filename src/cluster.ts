import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';

import { routes } from './routes';
import { TUser } from './types';
import { updateDb } from './inMemoryDB';

if (cluster.isPrimary) {
  const numCPUs = cpus().length;

  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork({ WORKER_PORT: 4000 + i + 1 });
    worker.on('message', (msg) => {
      for (const id in cluster.workers) {
        cluster.workers[id]?.send(msg);
      }
    });
  }
} else {
  process.on('message', (msg: TUser[]) => {
    updateDb(msg);
  });

  const PORT = process.env.WORKER_PORT;
  const server = http.createServer(routes);

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running at ${PORT}`);
  });
}

process.on('SIGINT', () => {
  process.disconnect();
});
