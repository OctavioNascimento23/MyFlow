import { useTranslation } from 'react-i18next';
import { StickyNote } from 'lucide-react';

const Notes = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <StickyNote className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          {t('notes.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('notes.allNotes')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <div className="max-w-md mx-auto">
          <StickyNote className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common.comingSoon')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('notes.noNotes')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notes;

// Made with Bob
