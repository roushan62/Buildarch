/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  Mic, 
  Layers, 
  Paintbrush, 
  LogOut 
} from 'lucide-react';
import { ChatSession, ArtifactType } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onLaunchArtifact: (type: ArtifactType) => void;
  onSignOut: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  isCollapsed,
  onToggleCollapse,
  onSelectSession,
  onCreateSession,
  onLaunchArtifact,
  onSignOut
}: SidebarProps) {
  const toolsList = [
    { type: 'estimator' as ArtifactType, icon: <Calculator className="w-4.5 h-4.5 text-emerald-400" />, label: 'Material Estimator' },
    { type: 'boq' as ArtifactType, icon: <FileSpreadsheet className="w-4.5 h-4.5 text-blue-400" />, label: 'BOQ Spreadsheet' },
    { type: 'invoice' as ArtifactType, icon: <FileText className="w-4.5 h-4.5 text-indigo-400" />, label: 'GST Invoice Engine' },
    { type: 'dpr' as ArtifactType, icon: <Mic className="w-4.5 h-4.5 text-red-400" />, label: 'Daily Progress Log' },
    { type: 'kanban' as ArtifactType, icon: <Layers className="w-4.5 h-4.5 text-amber-400" />, label: 'Inventory & Payroll' },
    { type: 'design' as ArtifactType, icon: <Paintbrush className="w-4.5 h-4.5 text-purple-400" />, label: 'AI Interior Design' }
  ];

  return (
    <aside 
      className={`bg-[#090C11] border-r border-gray-900 flex flex-col transition-all duration-300 relative z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-900">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#0A0D14]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              BuildArch Enterprise
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center mx-auto">
            <Building2 className="w-4.5 h-4.5 text-[#0A0D14]" />
          </div>
        )}
        <button 
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 bg-gray-950 border border-gray-800 rounded-full p-1 text-gray-500 hover:text-white cursor-pointer hover:border-gray-700 shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Start New Chat */}
      <div className="p-3">
        <button 
          onClick={onCreateSession}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium rounded-xl border border-dashed transition-all cursor-pointer ${
            isCollapsed 
              ? 'border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-400' 
              : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/40'
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Project Session</span>}
        </button>
      </div>

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {!isCollapsed && (
          <div className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Recent Sessions
          </div>
        )}
        {sessions.length === 0 ? (
          !isCollapsed && (
            <div className="text-xs text-gray-600 px-3 py-2 italic font-light">
              No active sessions.
            </div>
          )
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 text-xs flex items-center gap-2.5 transition-all cursor-pointer group ${
                  isActive 
                    ? 'bg-gray-900 text-emerald-400 border border-gray-800/80 font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/30 border border-transparent'
                }`}
              >
                <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 pr-1 group-hover:text-white transition-colors">
                    {session.title}
                  </span>
                )}
              </button>
            );
          })
        )}

        {/* Operational Modules shortcut section */}
        <div className="pt-6 border-t border-gray-900 mt-4">
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Operational Workspace
            </div>
          )}
          <div className="space-y-0.5">
            {toolsList.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onLaunchArtifact(tool.type)}
                className={`w-full text-left rounded-xl px-3 py-2 flex items-center gap-2.5 transition-all cursor-pointer text-xs ${
                  isCollapsed ? 'justify-center py-2.5' : ''
                } text-gray-400 hover:text-white hover:bg-gray-900/50`}
                title={tool.label}
              >
                <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-gray-950 border border-gray-900 shadow-inner">
                  {tool.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate font-light text-gray-300 group-hover:text-white">
                    {tool.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-gray-900 bg-[#07090C]">
        <button 
          onClick={onSignOut}
          className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-xs font-light text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-500/5 border border-transparent transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-gray-500 hover:text-red-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Sign Out BuildArch</span>}
        </button>
      </div>
    </aside>
  );
}
