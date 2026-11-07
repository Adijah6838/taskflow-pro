import db from '../database/db';

export const getDashboardStats = () => {
  // 1. Project Stats
  const totalProjects = db.prepare(`SELECT COUNT(*) as count FROM projects`).get() as { count: number };
  const activeProjects = db.prepare(`SELECT COUNT(*) as count FROM projects WHERE status = 'ACTIVE'`).get() as { count: number };
  const completedProjects = db.prepare(`SELECT COUNT(*) as count FROM projects WHERE status = 'COMPLETED'`).get() as { count: number };

  // 2. Task Stats
  const totalTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks`).get() as { count: number };
  const completedTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE status = 'COMPLETED'`).get() as { count: number };
  const pendingTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE status != 'COMPLETED'`).get() as { count: number };
  const criticalTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE priority = 'CRITICAL'`).get() as { count: number };
  
  const now = new Date().toISOString();
  const overdueTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE dueDate < ? AND status != 'COMPLETED'`).get(now) as { count: number };

  return {
    projects: {
      total: totalProjects?.count || 0,
      active: activeProjects?.count || 0,
      completed: completedProjects?.count || 0,
    },
    tasks: {
      total: totalTasks?.count || 0,
      completed: completedTasks?.count || 0,
      pending: pendingTasks?.count || 0,
      overdue: overdueTasks?.count || 0,
      critical: criticalTasks?.count || 0,
    }
  };
};

export const getChartData = () => {
  const tasksByStatus = db.prepare(`
    SELECT status as name, COUNT(*) as value FROM tasks GROUP BY status
  `).all() as any[];

  const tasksByPriority = db.prepare(`
    SELECT priority as name, COUNT(*) as value FROM tasks GROUP BY priority
  `).all() as any[];

  const developerWorkload = db.prepare(`
    SELECT u.name, COUNT(t.id) as value 
    FROM users u
    JOIN tasks t ON u.id = t.assignedUserId
    WHERE t.status != 'COMPLETED'
    GROUP BY u.id
  `).all() as any[];

  const completionTrend = db.prepare(`
    SELECT strftime('%Y-%m', updatedAt) as month, COUNT(*) as value 
    FROM tasks 
    WHERE status = 'COMPLETED' 
    GROUP BY month
  `).all() as any[];

  return {
    tasksByStatus,
    tasksByPriority,
    developerWorkload,
    completionTrend
  };
};