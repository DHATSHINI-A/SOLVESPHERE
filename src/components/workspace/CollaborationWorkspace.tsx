import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collaborationService } from '../../services/collaborationService';
import { useAuth } from '../../context/AuthContext';
import type { CollaborationProject, WorkspaceTask } from '../../types';
import { Button } from '../ui/Button';
import { StepperPipeline } from '../ui/StepperPipeline';
import { AsyncBoundary } from '../ui/AsyncBoundary';
import {
  Kanban,
  MessageSquare,
  FileText,
  Plus,
  Send,
  Rocket,
  Download,
  Users,
  Upload,
} from 'lucide-react';

export const CollaborationWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, role, addNotification } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'discussion' | 'files' | 'progress'>('tasks');
  const [collab, setCollab] = useState<CollaborationProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<WorkspaceTask['priority']>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Dr. Anitha Rao');

  // Chat message state
  const [messageInput, setMessageInput] = useState('');

  const fetchCollab = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await collaborationService.getCollaborationById(projectId || 'c1');
      if (res.data) setCollab(res.data);
      else setIsError(true);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollab();
  }, [projectId]);

  const handleUpdateTaskStatus = async (taskId: string, status: WorkspaceTask['status']) => {
    if (!collab) return;
    const res = await collaborationService.updateTaskStatus(collab.id, taskId, status);
    if (res.data) {
      setCollab(res.data);
      addNotification('Task Status Updated', `Task moved to ${status}. Project TRL Level recalculated.`, 'info');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collab || !newTaskTitle) return;

    await collaborationService.addTask(collab.id, {
      title: newTaskTitle,
      status: 'To Do',
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });

    setNewTaskTitle('');
    setShowNewTaskModal(false);
    fetchCollab();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collab || !messageInput.trim()) return;

    await collaborationService.addMessage(collab.id, {
      sender: user?.name || 'Researcher',
      senderRole: role,
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      content: messageInput.trim(),
    });

    setMessageInput('');
    fetchCollab();
  };

  const handleDeploy = () => {
    if (!collab) return;
    navigate(`/collaboration/${collab.id}/deployment`);
  };

  const columns: { id: WorkspaceTask['status']; label: string; color: string }[] = [
    { id: 'To Do', label: 'To Do / Backlog', color: 'border-amber-400 bg-amber-50/20' },
    { id: 'In Progress', label: 'In Progress (Active Testing)', color: 'border-blue-400 bg-blue-50/20' },
    { id: 'Done', label: 'Completed (TRL Verified)', color: 'border-emerald-400 bg-emerald-50/20' },
  ];

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      isEmpty={!collab}
      emptyTitle="Workspace Not Found"
      emptyMessage="No active collaboration project matches the requested ID."
    >
      {collab && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Project Banner */}
          <div className="civic-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#1E2A5E] border border-indigo-200">
                    Workspace #{collab.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#1F9D55] border border-emerald-200">
                    TRL-{collab.trlLevel} / 9 Readiness
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2A5E] font-heading">
                  {collab.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Multidisciplinary taskforce bridging academic laboratory development with industry CSR fabrication.
                </p>
              </div>

              {/* Ready for Deployment Action */}
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleDeploy}
                  icon={<Rocket className="w-4 h-4" />}
                >
                  Mark Ready for Deployment
                </Button>
              </div>
            </div>

            {/* Stepper Pipeline for Project Stage */}
            <div className="pt-4 border-t border-slate-100">
              <StepperPipeline currentStage={collab.pipelineStep || 'build'} />
            </div>

            {/* Project Quick Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Milestone Progress</span>
                <span className="text-xl font-extrabold text-[#1E2A5E] font-mono-data mt-0.5 block">{collab.progress}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Allocated Budget</span>
                <span className="text-xl font-extrabold text-[#1F9D55] font-mono-data mt-0.5 block">₹{(collab.budget / 100000).toFixed(1)} Lakhs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Tasks</span>
                <span className="text-xl font-extrabold text-[#3E5C9A] font-mono-data mt-0.5 block">{collab.tasks.length} Items</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Members</span>
                <span className="text-xl font-extrabold text-[#FF6B4A] font-mono-data mt-0.5 block">{collab.members.length} Solvers</span>
              </div>
            </div>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'tasks', label: 'Kanban Task Board', icon: Kanban },
              { id: 'discussion', label: 'Team Chat & Decisions', icon: MessageSquare },
              { id: 'files', label: 'Files & Specifications', icon: FileText },
              { id: 'overview', label: 'Taskforce Members', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#1E2A5E] text-[#1E2A5E]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ─── TAB 1: KANBAN TASK BOARD ──────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1E2A5E] uppercase tracking-wider">
                  Sprint Workflow Tasks
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowNewTaskModal(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Task
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col) => {
                  const tasksInCol = collab.tasks.filter((t) => t.status === col.id);
                  return (
                    <div
                      key={col.id}
                      className={`civic-card p-4 border-t-4 ${col.color} space-y-3 min-h-[380px] flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold text-[#1E2A5E] uppercase">
                            {col.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 font-mono-data">
                            {tasksInCol.length}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {tasksInCol.map((task) => (
                            <div
                              key={task.id}
                              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-bold text-[#1E2A5E] leading-snug">
                                  {task.title}
                                </h5>
                                <span
                                  className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                                    task.priority === 'high'
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-50">
                                <span>{task.assignee}</span>
                                <span>Due: {task.dueDate}</span>
                              </div>

                              {/* State Transition Controls */}
                              <div className="pt-2 flex items-center justify-between gap-1 text-[10px] border-t border-slate-100">
                                {col.id !== 'To Do' && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, col.id === 'Done' ? 'In Progress' : 'To Do')}
                                    className="text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
                                  >
                                    ← Back
                                  </button>
                                )}
                                {col.id !== 'Done' && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, col.id === 'To Do' ? 'In Progress' : 'Done')}
                                    className="text-[#3E5C9A] hover:text-[#1E2A5E] font-bold ml-auto cursor-pointer"
                                  >
                                    Advance →
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB 2: DISCUSSION CHAT ─────────────────────────────────── */}
          {activeTab === 'discussion' && (
            <div className="civic-card p-6 flex flex-col h-[560px] justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1E2A5E]">R&D Taskforce Live Discussion</h3>
                  <p className="text-[11px] text-slate-500">Real-time collaborative logging & engineering decisions.</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-[#1F9D55] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#1F9D55] animate-ping" />
                  Encrypted Workspace Channel
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {collab.discussions.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <img
                      src={msg.avatar}
                      alt={msg.sender || msg.senderName || 'Sender'}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="flex-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1E2A5E]">{msg.sender || msg.senderName}</span>
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Share engineering progress, lab metrics, or fabrication status..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                />
                <Button type="submit" variant="primary" size="md" icon={<Send className="w-3.5 h-3.5" />}>
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* ─── TAB 3: SPECIFICATION FILES ────────────────────────────── */}
          {activeTab === 'files' && (
            <div className="civic-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#1E2A5E]">Engineering Schematics & Test Data ({collab.files.length})</h3>
                <Button variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5" />}>
                  Upload File
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {collab.files.map((file) => (
                  <div key={file.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#3E5C9A] flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#1E2A5E]">{file.name}</h5>
                        <span className="text-[10px] text-slate-400">{file.size} · Uploaded by {file.uploadedBy} ({file.date})</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 4: TASKFORCE MEMBERS ──────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="civic-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#1E2A5E]">Active Taskforce Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {collab.members.map((m) => (
                  <div key={m.userId} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1E2A5E]">{m.name}</h4>
                      <p className="text-[10px] font-semibold text-[#3E5C9A]">{m.role}</p>
                      <p className="text-[10px] text-slate-400">{m.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Add Task Modal ────────────────────────────────────────── */}
          {showNewTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-[#1E2A5E] font-heading">Add New Workspace Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Conduct field spectrometry test in Tiruvottiyur"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Priority Level</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Assignee</label>
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1A1D29] focus:outline-none focus:border-[#1E2A5E]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewTaskModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Create Task
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </AsyncBoundary>
  );
};
