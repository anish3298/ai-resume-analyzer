import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { analysisAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await analysisAPI.getHistory({ page: pageNum, limit: 10, search: searchTerm });
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory(1, search);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Analysis History</h1>

      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by resume filename..."
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : reports.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No analysis reports found.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link
              to={`/analysis/${r._id}`}
              key={r._id}
              className="card flex items-center justify-between hover:shadow-md transition-shadow block"
            >
              <div>
                <p className="font-medium text-sm">{r.resume?.originalFileName || 'Resume'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                  {r.jobDescription?.title ? ` · vs ${r.jobDescription.title}` : ''}
                </p>
              </div>
              <span className="text-sm font-bold text-primary-600">{r.atsScore}/100</span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
