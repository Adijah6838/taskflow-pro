import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { initializeDatabase } from './database/schema';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import collaborationRoutes from './routes/collaboration.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Initialize the database BEFORE setting up routes
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/collab', collaborationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'TaskFlow Pro API is running smoothly' 
  });
});

// Start the server (Only if not running tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`?? Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

export default app;
