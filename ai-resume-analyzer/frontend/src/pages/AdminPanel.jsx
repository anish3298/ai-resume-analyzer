import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, FileText, TrendingUp, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminAPI } from '../services/api';
import LoadingSkeleton, { CardSkeleton } from '../components/LoadingSkeleton';

const TABS = ['Overview', 'Users', 'Resumes'];

const AdminPanel = () => {
  const [tab, setTab] = useState('Overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    const { data } = await adminAPI.getAnalytics();
    setAnalytics(data.analytics);
  };
  const loadUsers = async () => {
    const { data } = await adminAPI.getUsers({ page: 1, limit: 50 });
    setUsers(data.users);
  };
  const loadResumes = async () => {
    const { data } = await adminAPI.getResumes({ page: 1, limit: 50 });
    setResumes(data.resumes);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([loadOverview(), loadUsers(), loadResumes()]);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDeleteResume = async (id) => {
    if (!confirm('Delete this resume permanently?')) return;
    try {
      await adminAPI.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && analytics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex items-center gap-3">
              <Users className="text-primary-600" size={24} />
              <div>
                <p className="text-xl font-bold">{analytics.totalUsers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <FileText className="text-primary-600" size={24} />
              <div>
                <p className="text-xl font-bold">{analytics.totalResumes}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resumes Uploaded</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <TrendingUp className="text-primary-600" size={24} />
              <div>
                <p className="text-xl font-bold">{analytics.totalAnalyses}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analyses Run</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <p className="text-xl font-bold">{analytics.averageATSScore}/100</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. ATS Score</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Signups (Last 30 Days)</h2>
            {analytics.signupsByDay.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.signupsByDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No signups in the last 30 days.</p>
            )}
          </div>
        </>
      )}

      {tab === 'Users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">Verified</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">{u.isVerified ? '✅' : '—'}</td>
                  <td className="py-3">
                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Resumes' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">Uploaded</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-3 pr-4 font-medium">{r.originalFileName}</td>
                  <td className="py-3 pr-4">{r.user?.name} ({r.user?.email})</td>
                  <td className="py-3 pr-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 capitalize">{r.status}</td>
                  <td className="py-3">
                    <button onClick={() => handleDeleteResume(r._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
