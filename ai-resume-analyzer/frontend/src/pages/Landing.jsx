import { Link } from 'react-router-dom';
import { Sparkles, FileText, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="card">
    <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 w-fit mb-3">
      <Icon size={20} />
    </div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
  </div>
);

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full mb-4">
        
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
        Land your next job with a resume that <span className="text-primary-600">beats the ATS</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Upload your resume, get an instant ATS score, discover missing skills, and match it against any job
        description — all powered by AI.
      </p>
      <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-base px-8 py-3">
        {user ? 'Go to Dashboard' : 'Get Started Free'}
      </Link>

      <div className="grid sm:grid-cols-3 gap-4 mt-16 text-left">
        <Feature icon={FileText} title="Smart Parsing" desc="Automatically extracts skills, education, and experience from any PDF resume." />
        <Feature icon={BarChart3} title="ATS Scoring" desc="Get a 0-100 score and actionable feedback on formatting, grammar, and content." />
        <Feature icon={ShieldCheck} title="Job Matching" desc="Paste any job description to see your match percentage and missing keywords." />
      </div>
    </div>
  );
};

export default Landing;
