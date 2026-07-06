import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Award, History, UploadCloud } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { analysisAPI } from '../services/api';
import SkillGapChart from '../components/SkillGapChart';
import { CardSkeleton } from '../components/LoadingSkeleton';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          analysisAPI.getDashboardStats(),
          analysisAPI.getHistory({ page: 1, limit: 5 }),
        ]);
        setStats(statsRes.data.stats);
        setHistory(historyRes.data.reports);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const trendData = (stats?.trend || []).map((t, i) => ({
    name: `#${i + 1}`,
    score: t.score,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your resume improvement journey</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 w-fit">
          <UploadCloud size={18} /> Upload Resume
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Resumes Analyzed"
          value={stats?.totalAnalyzed ?? 0}
          color="bg-primary-50 dark:bg-primary-900/30 text-primary-600"
        />
        <StatCard
          icon={Award}
          label="Average ATS Score"
          value={`${stats?.averageScore ?? 0}/100`}
          color="bg-green-50 dark:bg-green-900/30 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Improvement Trend"
          value={trendData.length > 1 ? (trendData.at(-1).score >= trendData[0].score ? 'Improving' : 'Declining') : 'N/A'}
          color="bg-amber-50 dark:bg-amber-900/30 text-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-4">Score Trend</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyze your first resume to see your trend.</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Top Skill Gaps</h2>
          <SkillGapChart data={stats?.skillGap || []} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <History size={18} /> Recent Analyses
          </h2>
          <Link to="/history" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No analyses yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {history.map((h) => (
              <div key={h._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{h.resume?.originalFileName || 'Resume'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary-600">{h.atsScore}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
