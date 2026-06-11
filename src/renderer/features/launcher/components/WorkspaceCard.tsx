/**
 * Workspace Card Component
 * Displays a workspace with execute, edit, and delete actions
 */

import React, { useState } from 'react';
import { Workspace } from '../../../../shared/types/database';
import { Button } from '../../../components/ui/button';
import { Play, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkspaceCardProps {
  workspace: Workspace;
  isExecuting: boolean;
  onExecute: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isExecuting,
  onExecute,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`
        relative p-6 rounded-lg border-2 transition-all
        ${workspace.enabled 
          ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md' 
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
        ${isExecuting ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{workspace.icon || '🚀'}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {workspace.name}
            </h3>
            <p className="text-sm text-gray-500">
              {workspace.actions.length} {t('launcher.actions')}
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={`
            p-2 rounded-lg transition-colors
            ${workspace.enabled 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-gray-400 hover:bg-gray-100'
            }
          `}
          title={workspace.enabled ? t('launcher.disable') : t('launcher.enable')}
        >
          {workspace.enabled ? <Power size={20} /> : <PowerOff size={20} />}
        </button>
      </div>

      {/* Action Summary */}
      <div className="mb-4 space-y-1">
        {workspace.actions.slice(0, 3).map((action, index) => (
          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-gray-400">•</span>
            <span className="truncate">
              {action.type === 'open_app' && `${t('launcher.actionTypes.open_app')}: ${action.path?.split('\\').pop()}`}
              {action.type === 'open_url' && `${t('launcher.actionTypes.open_url')}: ${action.url}`}
              {action.type === 'wait' && `${t('launcher.actionTypes.wait')}: ${(action.delay || 0) / 1000}s`}
              {action.type === 'notification' && `${t('launcher.actionTypes.notification')}: ${action.message}`}
              {action.type === 'open_folder' && `${t('launcher.actionTypes.open_folder')}: ${action.path?.split('\\').pop()}`}
            </span>
          </div>
        ))}
        {workspace.actions.length > 3 && (
          <div className="text-sm text-gray-400">
            +{workspace.actions.length - 3} {t('launcher.moreActions')}
          </div>
        )}
      </div>

      {/* Triggers */}
      {workspace.trigger.onStartup && (
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {t('launcher.runsOnStartup')}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onExecute}
          disabled={!workspace.enabled || isExecuting}
          className="flex-1"
          variant="default"
        >
          {isExecuting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              {t('launcher.executing')}
            </>
          ) : (
            <>
              <Play size={16} className="mr-2" />
              {t('launcher.execute')}
            </>
          )}
        </Button>

        <Button
          onClick={onEdit}
          variant="outline"
          size="icon"
          title={t('launcher.edit')}
        >
          <Edit size={16} />
        </Button>

        <Button
          onClick={handleDelete}
          variant={showDeleteConfirm ? 'destructive' : 'outline'}
          size="icon"
          title={showDeleteConfirm ? t('launcher.confirmDelete') : t('launcher.delete')}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

// Made with Bob