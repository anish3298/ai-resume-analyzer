import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { resumeAPI, analysisAPI } from '../services/api';
import ResumeCard from '../components/ResumeCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getAll({ page: 1, limit: 20 });
      setResumes(data.resumes);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume permanently?')) return;
    try {
      await resumeAPI.delete(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleAnalyze = async (resume) => {
    const toastId = toast.loading('Running AI analysis...');
    try {
      const { data } = await analysisAPI.runATS(resume._id, '');
      toast.success('Analysis complete!', { id: toastId });
      navigate(`/analysis/${data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed', { id: toastId });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Resumes</h1>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <UploadCloud size={16} /> Upload New
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : resumes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't uploaded any resumes yet.</p>
          <Link to="/upload" className="btn-primary w-fit mx-auto">
            Upload your first resume
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <ResumeCard key={r._id} resume={r} onDelete={handleDelete} onAnalyze={handleAnalyze} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResumes;
