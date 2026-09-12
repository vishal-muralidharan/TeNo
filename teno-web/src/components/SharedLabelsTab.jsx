import React, { useEffect, useState } from 'react';
import GenerateInvite from './GenerateInvite';

export default function SharedLabelsTab({ user, isActive }) {
  const [labels, setLabels] = useState([]);
  
  useEffect(() => {
    if (!user || !isActive) return;

    // Mock data to demonstrate Role-Based Access Control (RBAC) UI
    const mockLabels = [
      { id: 'label_1', name: 'Family Links', members: { [user.uid]: 'owner' }, inviteToken: 'abc' },
      { id: 'label_2', name: 'Work Project', members: { [user.uid]: 'editor' }, inviteToken: 'def' },
      { id: 'label_3', name: 'Public Resources', members: { [user.uid]: 'viewer' }, inviteToken: 'xyz' },
    ];
    setLabels(mockLabels);
  }, [user, isActive]);

  if (!isActive) return null;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Shared Labels (RBAC Example)</h2>
      {labels.map(label => {
        const userRole = label.members[user.uid];
        const canEdit = userRole === 'owner' || userRole === 'editor';
        const isOwner = userRole === 'owner';

        return (
          <div key={label.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-md shadow-sm bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                {label.name} <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-2">{userRole}</span>
              </h3>
              {isOwner && (
                <GenerateInvite labelId={label.id} currentToken={label.inviteToken} />
              )}
            </div>
            
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800">
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Links will appear here...</p>
               <div className="space-x-2">
                {canEdit && (
                  <button className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors">
                    + Add Link
                  </button>
                )}
                {canEdit && (
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors">
                    Edit Link
                  </button>
                )}
                {isOwner && (
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors">
                    Delete Label
                  </button>
                )}
                {!canEdit && (
                  <p className="text-sm text-gray-400 italic">View-only mode. You do not have permission to add or edit links.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
