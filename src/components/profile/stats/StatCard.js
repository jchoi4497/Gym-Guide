function StatCard({ title, value, subtitle, highlight = false }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${highlight ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white'}`}>
      <div className={`text-sm mb-2 ${highlight ? 'text-blue-100' : 'text-gray-600'}`}>{title}</div>
      <div className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-gray-800'}`}>{value}</div>
      {subtitle && (
        <div className={`text-sm mt-2 ${highlight ? 'text-blue-100' : 'text-gray-600'} truncate`}>{subtitle}</div>
      )}
    </div>
  );
}

export default StatCard;
