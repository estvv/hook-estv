import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { hooksRoutes, catchAllRoutes } from './routes/index.js';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 2);

app.use(cors());
app.use(express.json({
  limit: process.env.MAX_REQUEST_SIZE || '1mb'
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', limiter);
app.use('/api', hooksRoutes());
app.use('/', catchAllRoutes());

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;