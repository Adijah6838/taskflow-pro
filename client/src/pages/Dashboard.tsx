import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  projects: { total: number; active: number; completed: number };
  tasks: { total: number; completed: number; pending: number; overdue: number; critical: number };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Only fetch if user is Admin or Manager
        if (user?.role === 'DEVELOPER') {
          setError('Analytics are only available to Admins and Project Managers.');
          setLoading(false);
          return;
        }

        const [statsRes, chartsRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/charts')
        ]);
        
        setStats(statsRes.data.stats);
        setCharts(chartsRes.data.charts);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading Analytics...</div>;
  
  if (error) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded border border-yellow-200">
        <h3 className="font-bold">Notice</h3>
        <p>{error}</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium">Total Projects</p>
            <p className="text-3xl font-bold text-gray-800">{stats.projects.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium">Active Projects</p>
            <p className="text-3xl font-bold text-gray-800">{stats.projects.active}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-medium">Pending Tasks</p>
            <p className="text-3xl font-bold text-gray-800">{stats.tasks.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <p className="text-gray-500 text-sm font-medium">Overdue Tasks</p>
            <p className="text-3xl font-bold text-gray-800">{stats.tasks.overdue}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Tasks by Status (Pie) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tasks by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.tasksByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {charts.tasksByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks by Priority (Bar) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tasks by Priority</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.tasksByPriority}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;