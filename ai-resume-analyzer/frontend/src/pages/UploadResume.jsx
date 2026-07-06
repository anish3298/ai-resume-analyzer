import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, X, Sparkles } from 'lucide-react';
import { resumeAPI, analysisAPI } from '../services/api';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUploadAndAnalyze = async () => {
    if (!file) return toast.error('Please select a PDF resume first');

    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const { data: uploadData } = await resumeAPI.upload(formData, (evt) => {
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });

      setUploading(false);
      setAnalyzing(true);

      const { data: analysisData } = await analysisAPI.runATS(uploadData.resume._id, targetRole);

      toast.success('Analysis complete!');
      navigate(`/analysis/${analysisData.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload/analysis failed');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Upload your resume</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        We'll extract, parse, and score your resume like a real ATS system.
      </p>

      <div
        {...getRootProps()}
        className={`card border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-12 transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className="text-primary-600 mb-3" />
        <p className="font-medium">{isDragActive ? 'Drop your resume here' : 'Drag & drop your PDF resume'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to browse (max 5MB, PDF only)</p>
      </div>

      {file && (
        <div className="card mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-primary-600" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-medium mb-1 block">Target job role (optional)</label>
        <input
          type="text"
          placeholder="e.g. Frontend Developer, Data Analyst"
          className="input-field"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
      </div>

      {(uploading || analyzing) && (
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: uploading ? `${progress}%` : '100%' }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {uploading ? `Uploading... ${progress}%` : 'Running AI analysis...'}
          </p>
        </div>
      )}

      <button
        onClick={handleUploadAndAnalyze}
        disabled={!file || uploading || analyzing}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};

export default UploadResume;
