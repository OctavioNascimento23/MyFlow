/**
 * Action Editor Component
 * Edits a single workspace action
 */

import React from 'react';
import { WorkspaceAction } from '../../../../shared/types/database';
import { Button } from '../../../components/ui/button';
import { Trash2, GripVertical, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActionEditorProps {
  action: WorkspaceAction;
  index: number;
  onChange: (action: WorkspaceAction) => void;
  onDelete: () => void;
  onTest: () => void;
  onBrowseApp?: () => void;
  onBrowseFolder?: () => void;
}

export const ActionEditor: React.FC<ActionEditorProps> = ({
  action,
  index,
  onChange,
  onDelete,
  onTest,
  onBrowseApp,
  onBrowseFolder,
}) => {
  const { t } = useTranslation();

  const handleTypeChange = (type: WorkspaceAction['type']) => {
    // Reset action properties when type changes
    const newAction: WorkspaceAction = { type };
    
    if (type === 'wait') {
      newAction.delay = 1000;
    } else if (type === 'notification') {
      newAction.message = '';
    } else if (type === 'open_url') {
      newAction.url = '';
      newAction.browser = 'default';
    } else if (type === 'open_app' || type === 'open_folder') {
      newAction.path = '';
    }
    
    onChange(newAction);
  };

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Drag Handle */}
      <div className="flex items-center text-gray-400 cursor-move">
        <GripVertical size={20} />
      </div>

      {/* Action Number */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
        {index + 1}
      </div>

      {/* Action Content */}
      <div className="flex-1 space-y-3">
        {/* Action Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('launcher.actionType')}
          </label>
          <select
            value={action.type}
            onChange={(e) => handleTypeChange(e.target.value as WorkspaceAction['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open_app">{t('launcher.actionTypes.open_app')}</option>
            <option value="open_url">{t('launcher.actionTypes.open_url')}</option>
            <option value="open_folder">{t('launcher.actionTypes.open_folder')}</option>
            <option value="wait">{t('launcher.actionTypes.wait')}</option>
            <option value="notification">{t('launcher.actionTypes.notification')}</option>
          </select>
        </div>

        {/* Action-specific fields */}
        {action.type === 'open_app' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('launcher.appPath')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={action.path || ''}
                onChange={(e) => onChange({ ...action, path: e.target.value })}
                placeholder="C:\Program Files\App\app.exe"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={onBrowseApp}
                variant="outline"
              >
                {t('launcher.browse')}
              </Button>
            </div>
          </div>
        )}

        {action.type === 'open_folder' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('launcher.folderPath')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={action.path || ''}
                onChange={(e) => onChange({ ...action, path: e.target.value })}
                placeholder="C:\Users\Username\Documents"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={onBrowseFolder}
                variant="outline"
              >
                {t('launcher.browse')}
              </Button>
            </div>
          </div>
        )}

        {action.type === 'open_url' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('launcher.url')}
              </label>
              <input
                type="url"
                value={action.url || ''}
                onChange={(e) => onChange({ ...action, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('launcher.browser')}
              </label>
              <select
                value={action.browser || 'default'}
                onChange={(e) => onChange({ ...action, browser: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">{t('launcher.defaultBrowser')}</option>
                <option value="chrome">Google Chrome</option>
                <option value="firefox">Mozilla Firefox</option>
                <option value="edge">Microsoft Edge</option>
              </select>
            </div>
          </>
        )}

        {action.type === 'wait' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('launcher.delaySeconds')}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={(action.delay || 1000) / 1000}
              onChange={(e) => onChange({ ...action, delay: parseFloat(e.target.value) * 1000 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {action.type === 'notification' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('launcher.message')}
            </label>
            <input
              type="text"
              value={action.message || ''}
              onChange={(e) => onChange({ ...action, message: e.target.value })}
              placeholder={t('launcher.notificationPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={onTest}
          variant="outline"
          size="icon"
          title={t('launcher.testAction')}
        >
          <Play size={16} />
        </Button>
        <Button
          type="button"
          onClick={onDelete}
          variant="outline"
          size="icon"
          title={t('launcher.deleteAction')}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

// Made with Bob