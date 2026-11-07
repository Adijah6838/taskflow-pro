import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Only Admin and Project Managers should see the analytics dashboard
router.use(protect, restrictTo('ADMIN', 'PROJECT_MANAGER'));

router.get('/stats', AnalyticsController.getDashboardStats);
router.get('/charts', AnalyticsController.getChartData);

export default router;