import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { analysisAPI } from '../services/api';

const JobMatch = () => {
  const { resumeId } = useParams();
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (jobDescriptionText.trim().length < 20) {
      return toast.error('Please paste a more complete job description');
    }
    setLoading(true);
    try {
      const { data } = await analysisAPI.matchJD(resumeId, { jobDescriptionText, title, company });
      toast.success('Match analysis complete!');
      navigate(`/analysis/${data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Match against a Job Description</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Paste the job description and see your match percentage, missing keywords, and readiness.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job title (optional)"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Company (optional)"
            className="input-field"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <textarea
          rows={12}
          required
          placeholder="Paste the full job description here..."
          className="input-field resize-none"
          value={jobDescriptionText}
          onChange={(e) => setJobDescriptionText(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Sparkles size={18} /> {loading ? 'Matching...' : 'Compare Now'}
        </button>
      </form>
    </div>
  );
};

export default JobMatch;
