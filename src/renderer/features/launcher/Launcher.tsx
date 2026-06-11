/**
 * Launcher Page
 * Main page for managing and executing workspaces
 */

import React, { useEffect, useState } from 'react';
import { useLauncherStore } from '../../stores/launcherStore';
import { WorkspaceCard } from './components/WorkspaceCard';
import { WorkspaceForm } from './components/WorkspaceForm';
import { Workspace } from '../../../shared/types/database';
import { Button } from '../../components/ui/button';
import { Plus, Rocket, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Launcher: React.FC = () => {
  const { t } = useTranslation();
  const {
    workspaces,
    loading,
    error,
    executingWorkspaceId,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    executeWorkspace,
    toggleWorkspace,
    setError,
  } = useLauncherStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | undefined>();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = () => {
    setEditingWorkspace(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setIsFormOpen(true);
  };

  const handleSave = async (workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) => {
    if (editingWorkspace) {
      await updateWorkspace(editingWorkspace.id, workspace);
    } else {
      await createWorkspace(workspace);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('launcher.confirmDeleteWorkspace'))) {
      await deleteWorkspace(id);
    }
  };

  const handleExecute = async (id: string) => {
    setError(null);
    await executeWorkspace(id);
  };

  const handleToggle = async (id: string) => {
    await toggleWorkspace(id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Rocket size={32} className="text-blue-600" />
            {t('launcher.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('launcher.description')}</p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus size={20} className="mr-2" />
          {t('launcher.createWorkspace')}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">{t('launcher.executionError')}</h3>
            <p className="text-red-700 text-sm mt-1 whitespace-pre-wrap">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && workspaces.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && workspaces.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('launcher.noWorkspaces')}
            </h2>
            <p className="text-gray-600 mb-6">{t('launcher.noWorkspacesDescription')}</p>
            <Button onClick={handleCreate} size="lg">
              <Plus size={20} className="mr-2" />
              {t('launcher.createFirstWorkspace')}
            </Button>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      {!loading && workspaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isExecuting={executingWorkspaceId === workspace.id}
              onExecute={() => handleExecute(workspace.id)}
              onEdit={() => handleEdit(workspace)}
              onDelete={() => handleDelete(workspace.id)}
              onToggle={() => handleToggle(workspace.id)}
            />
          ))}
        </div>
      )}

      {/* Workspace Form Dialog */}
      <WorkspaceForm
        workspace={editingWorkspace}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

// Made with Bob
