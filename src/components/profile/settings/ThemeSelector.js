import { useTheme } from '../../../contexts/ThemeContext';
import { THEMES } from '../../../config/themes';

function ThemeSelector() {
  const { themeId, changeTheme, theme } = useTheme();

  const handleThemeChange = (newThemeId) => {
    changeTheme(newThemeId);
  };

  return (
    <div className={`${theme.cardBg} rounded-xl shadow-md p-6 ${theme.cardBorder}`}>
      <h3 className={`text-xl font-bold ${theme.cardText} mb-4`}>Appearance</h3>
      <p className={`${theme.cardTextSecondary} text-sm mb-4`}>
        Choose your preferred color theme
      </p>

      <div className="space-y-3">
        {Object.values(THEMES).map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              themeId === t.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold ${theme.cardText}`}>{t.name}</h4>
                <p className={`text-sm ${theme.cardTextSecondary}`}>{t.description}</p>
              </div>
              {themeId === t.id && (
                <div className="text-blue-500 text-xl">✓</div>
              )}
            </div>

            {/* Theme preview */}
            <div className="mt-3 flex gap-2">
              <div className={`w-12 h-12 rounded-md ${t.pageBg} border border-gray-300`}></div>
              <div className={`w-12 h-12 rounded-md ${t.cardBg} border border-gray-300`}></div>
              <div className={`w-12 h-12 rounded-md ${t.btnPrimary} border border-gray-300`}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;
