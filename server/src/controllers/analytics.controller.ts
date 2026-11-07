import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as AnalyticsModel from '../models/analytics.model';

export const getDashboardStats = (req: AuthRequest, res: Response) => {
  try {
    const stats = AnalyticsModel.getDashboardStats();
    res.status(200).json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChartData = (req: AuthRequest, res: Response) => {
  try {
    const charts = AnalyticsModel.getChartData();
    res.status(200).json({ charts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};