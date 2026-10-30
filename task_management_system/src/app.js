import express from 'express';
import cors from 'cors';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import authRouter from './routes/auth.js';
import taskRouter from './routes/tasks.js';
import aiRouter from './routes/ai.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ── API root — JSON info response
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Task Management API',
    version: '1.0.0',
    status: 'running',
    docs: {
      auth: {
        register: 'POST /api/register',
        login:    'POST /api/login',
      },
      tasks: {
        getAll:  'GET    /api/tasks',
        getOne:  'GET    /api/tasks/:id',
        create:  'POST   /api/tasks',
        update:  'PUT    /api/tasks/:id',
        delete:  'DELETE /api/tasks/:id',
      },
      ai: {
        generateDescription: 'POST /api/ai/generate-description',
        chat:                'POST /api/ai/chat  (SSE stream)',
      },
    },
    health: '/health',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime().toFixed(1) + 's', timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use('/api', authRouter);

// Task routes (protected — auth middleware applied inside taskRouter)
app.use('/api', taskRouter);

// AI routes (protected — auth middleware applied inside aiRouter)
app.use('/api', aiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;