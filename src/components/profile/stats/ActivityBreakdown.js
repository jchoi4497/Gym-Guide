import { MUSCLE_GROUP_OPTIONS } from '../../../config/constants';
import { useTheme } from '../../../contexts/ThemeContext';

function ActivityBreakdown({ stats }) {
  const { theme } = useTheme();
  const getLabel = (value) =>
    MUSCLE_GROUP_OPTIONS.find((option) => option.value === value)?.label || value;

  return (
    <div className={`${theme.cardBg} rounded-lg p-6`}>
      <h2 className={`text-2xl font-bold ${theme.headerText} mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]`}>Activity Breakdown</h2>
      <div className="space-y-3">
        {Object.entries(stats.muscleGroupBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([group, count]) => (
            <div key={group} className="flex items-center justify-between">
              <span className={`${theme.cardText} font-medium`}>{getLabel(group)}</span>
              <div className="flex items-center gap-3">
                <div className={`w-32 sm:w-48 ${theme.cardBgSecondary} rounded-full h-3`}>
                  <div
                    className="bg-slate-700 h-3 rounded-full transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                    style={{ width: `${(count / stats.totalWorkouts) * 100}%` }}
                  ></div>
                </div>
                <span className={`${theme.cardTextSecondary} font-semibold w-12 text-right`}>{count}</span>
              </div>
            </div>
          ))}
      </div>
      {stats.mostTrainedMuscleGroup && (
        <div className={`mt-4 pt-4 border-t ${theme.inputBorder}`}>
          <span className={`text-sm ${theme.cardTextSecondary}`}>Most Trained: </span>
          <span className={`font-bold ${theme.cardText}`}>{getLabel(stats.mostTrainedMuscleGroup)}</span>
        </div>
      )}
    </div>
  );
}

export default ActivityBreakdown;
