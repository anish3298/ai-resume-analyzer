import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, AlertTriangle, CheckCircle2, BookOpen, Briefcase, ArrowRight } from 'lucide-react';
import { analysisAPI } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import { CardSkeleton } from '../components/LoadingSkeleton';

// Since we don't have a direct getById for AnalysisReport, we reuse history and filter.
// In a production build you'd add GET /api/analysis/:id - included here for clarity.
const AnalysisResult = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await analysisAPI.getHistory({ page: 1, limit: 50 });
        const found = data.reports.find((r) => r._id === id);
        setAnalysis(found);
      } catch (err) {
        toast.error('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await analysisAPI.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-analysis-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">Analysis not found.</p>
        <Link to="/dashboard" className="text-primary-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const readinessColor =
    analysis.overallHiringReadiness === 'Strong'
      ? 'text-green-600 bg-green-50 dark:bg-green-900/30'
      : analysis.overallHiringReadiness === 'Moderate'
      ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
      : 'text-red-600 bg-red-50 dark:bg-red-900/30';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analysis Results</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{analysis.resume?.originalFileName}</p>
        </div>
        <button onClick={handleDownload} disabled={downloading} className="btn-secondary flex items-center gap-2 w-fit">
          <Download size={16} /> {downloading ? 'Preparing...' : 'Download Report'}
        </button>
      </div>

      <div className="card flex flex-col sm:flex-row items-center gap-8">
        <ScoreGauge score={analysis.atsScore} label="ATS Score" />
        <div className="flex-1 space-y-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${readinessColor}`}>
            {analysis.overallHiringReadiness}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.summary}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
            <AlertTriangle size={18} /> Missing Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(analysis.missingSkills || []).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">None found — great job!</p>
            )}
            {(analysis.missingSkills || []).map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-green-500">
            <CheckCircle2 size={18} /> Recommended Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(analysis.recommendedSkills || []).map((s, i) => (
              <span key={i} className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {analysis.strongerBulletPoints?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">Stronger Bullet Point Suggestions</h2>
          <div className="space-y-4">
            {analysis.strongerBulletPoints.map((bp, i) => (
              <div key={i} className="text-sm space-y-1">
                <p className="text-gray-500 dark:text-gray-400 line-through">{bp.original}</p>
                <p className="flex items-start gap-2 text-green-600 font-medium">
                  <ArrowRight size={16} className="mt-0.5 shrink-0" /> {bp.improved}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={18} /> Suggested Certifications
          </h2>
          <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-300">
            {(analysis.suggestedCertifications || []).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Briefcase size={18} /> Suggested Projects
          </h2>
          <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-300">
            {(analysis.suggestedProjects || []).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <Link
          to={`/job-match/${analysis.resume?._id}`}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Compare with a Job Description <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default AnalysisResult;
