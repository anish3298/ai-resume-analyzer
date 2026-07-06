import { FileText, Trash2, Sparkles } from 'lucide-react';

const ResumeCard = ({ resume, onDelete, onAnalyze }) => {
  return (
    <div className="card flex items-center justify-between hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600">
          <FileText size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate max-w-[200px]">{resume.originalFileName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(resume.createdAt).toLocaleDateString()} · {resume.status}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onAnalyze(resume)}
          className="btn-primary text-xs !py-2 !px-3 flex items-center gap-1"
        >
          <Sparkles size={14} /> Analyze
        </button>
        <button
          onClick={() => onDelete(resume._id)}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="Delete resume"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
