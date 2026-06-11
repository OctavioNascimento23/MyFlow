import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLanguageLabel = i18n.language === 'en' ? 'EN' : 'PT';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={t('settings.language')}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">{currentLanguageLabel}</span>
    </button>
  );
};

export default LanguageSwitcher;

// Made with Bob
