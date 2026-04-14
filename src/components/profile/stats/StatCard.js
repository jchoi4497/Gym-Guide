import { useTheme } from '../../../contexts/ThemeContext';

function StatCard({ title, value, subtitle, highlight = false }) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-6 ${highlight ? `${theme.cardBg}` : `${theme.cardBgSecondary}`}`}>
      <div className={`text-sm mb-2 ${highlight ? theme.cardText : theme.cardTextSecondary}`}>{title}</div>
      <div className={`text-3xl font-bold ${theme.cardText}`}>{value}</div>
      {subtitle && (
        <div className={`text-sm mt-2 ${theme.cardTextSecondary} truncate`}>{subtitle}</div>
      )}
    </div>
  );
}

export default StatCard;
