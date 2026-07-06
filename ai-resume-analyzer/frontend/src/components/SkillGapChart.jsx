import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SkillGapChart = ({ data = [] }) => {
  if (!data.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Not enough data yet — analyze a resume to see your skill gaps.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SkillGapChart;
