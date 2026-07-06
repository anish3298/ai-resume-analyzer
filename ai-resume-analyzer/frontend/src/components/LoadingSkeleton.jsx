const LoadingSkeleton = ({ rows = 3, className = '' }) => (
  <div className={`space-y-3 animate-pulse ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ width: `${90 - i * 10}%` }} />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card animate-pulse space-y-4">
    <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
  </div>
);

export default LoadingSkeleton;
