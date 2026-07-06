const ScoreGauge = ({ score = 0, label = 'ATS Score' }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor">
          {score}
        </text>
        <text x="70" y="85" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6">
          / 100
        </text>
      </svg>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</span>
    </div>
  );
};

export default ScoreGauge;
