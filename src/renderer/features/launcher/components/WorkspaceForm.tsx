/**
 * Workspace Form Component
 * Create/Edit workspace dialog with actions management
 */

import React, { useState, useEffect } from 'react';
import { Workspace, WorkspaceAction } from '../../../../shared/types/database';
import { Button } from '../../../components/ui/button';
import { X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionEditor } from './ActionEditor';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceFormProps {
  workspace?: Workspace;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) => void;
}

export const WorkspaceForm: React.FC<WorkspaceFormProps> = ({
  workspace,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [enabled, setEnabled] = useState(true);
  const [onStartup, setOnStartup] = useState(false);
  const [actions, setActions] = useState<WorkspaceAction[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with workspace data
  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setIcon(workspace.icon || '🚀');
      setEnabled(workspace.enabled);
      setOnStartup(workspace.trigger.onStartup);
      setActions(workspace.actions);
    } else {
      // Reset form for new workspace
      setName('');
      setIcon('🚀');
      setEnabled(true);
      setOnStartup(false);
      setActions([]);
    }
    setErrors({});
  }, [workspace, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('launcher.errors.nameRequired');
    }

    if (actions.length === 0) {
      newErrors.actions = t('launcher.errors.actionsRequired');
    }

    // Validate each action
    actions.forEach((action, index) => {
      if (action.type === 'open_app' && !action.path) {
        newErrors[`action_${index}`] = t('launcher.errors.appPathRequired');
      }
      if (action.type === 'open_url' && !action.url) {
        newErrors[`action_${index}`] = t('launcher.errors.urlRequired');
      }
      if (action.type === 'open_folder' && !action.path) {
        newErrors[`action_${index}`] = t('launcher.errors.folderPathRequired');
      }
      if (action.type === 'notification' && !action.message) {
        newErrors[`action_${index}`] = t('launcher.errors.messageRequired');
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const workspaceData: Omit<Workspace, 'createdAt' | 'updatedAt'> = {
      id: workspace?.id || uuidv4(),
      name: name.trim(),
      icon,
      enabled,
      actions,
      trigger: {
        onStartup,
        hotkey: workspace?.trigger.hotkey,
        scheduledTime: workspace?.trigger.scheduledTime,
      },
    };

    onSave(workspaceData);
    onClose();
  };

  const handleAddAction = () => {
    setActions([...actions, { type: 'open_app', path: '' }]);
  };

  const handleUpdateAction = (index: number, action: WorkspaceAction) => {
    const newActions = [...actions];
    newActions[index] = action;
    setActions(newActions);
  };

  const handleDeleteAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleTestAction = async (action: WorkspaceAction) => {
    try {
      const result = await window.electronAPI.launcher.testAction(action);
      if (result.success) {
        alert(t('launcher.testSuccess'));
      } else {
        alert(t('launcher.testFailed') + ': ' + result.error);
      }
    } catch (error) {
      alert(t('launcher.testFailed') + ': ' + (error as Error).message);
    }
  };

  const handleBrowseApp = async (index: number) => {
    try {
      const path = await window.electronAPI.launcher.browseForApp();
      if (path) {
        handleUpdateAction(index, { ...actions[index], path });
      }
    } catch (error) {
      console.error('Error browsing for app:', error);
    }
  };

  const handleBrowseFolder = async (index: number) => {
    try {
      const path = await window.electronAPI.launcher.browseForFolder();
      if (path) {
        handleUpdateAction(index, { ...actions[index], path });
      }
    } catch (error) {
      console.error('Error browsing for folder:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {workspace ? t('launcher.editWorkspace') : t('launcher.createWorkspace')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('launcher.workspaceName')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('launcher.workspaceNamePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('launcher.icon')}
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🚀"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={2}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t('launcher.enableWorkspace')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onStartup}
                onChange={(e) => setOnStartup(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t('launcher.runOnStartup')}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('launcher.actions')} *
              </label>
              <Button
                type="button"
                onClick={handleAddAction}
                variant="outline"
                size="sm"
              >
                <Plus size={16} className="mr-1" />
                {t('launcher.addAction')}
              </Button>
            </div>

            {errors.actions && (
              <p className="mb-3 text-sm text-red-600">{errors.actions}</p>
            )}

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div key={index}>
                  <ActionEditor
                    action={action}
                    index={index}
                    onChange={(updatedAction) => handleUpdateAction(index, updatedAction)}
                    onDelete={() => handleDeleteAction(index)}
                    onTest={() => handleTestAction(action)}
                    onBrowseApp={() => handleBrowseApp(index)}
                    onBrowseFolder={() => handleBrowseFolder(index)}
                  />
                  {errors[`action_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`action_${index}`]}
                    </p>
                  )}
                </div>
              ))}

              {actions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {t('launcher.noActionsYet')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            variant="default"
          >
            {workspace ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Made with Bob