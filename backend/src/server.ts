import app from './app';
import { config } from './config';

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 RideSafe AI Backend running on http://0.0.0.0:${config.port}`);
  console.log(`🛡️ Health check available at http://localhost:${config.port}/api/health`);
});

export default server;
