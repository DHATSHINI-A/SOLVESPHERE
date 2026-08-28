import type { CollaborationProject, WorkspaceTask, DiscussionMessage } from '../types';
import initialCollaborationsData from '../data/mockData/collaborations.json';

const STORAGE_KEY = 'sih_collaborations_data';

const getStoredCollaborations = (): CollaborationProject[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialCollaborationsData as CollaborationProject[];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCollaborationsData));
  return initialCollaborationsData as CollaborationProject[];
};

const saveCollaborations = (data: CollaborationProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const collaborationService = {
  getCollaborations: async (): Promise<{ data: CollaborationProject[] }> => {
    await new Promise((r) => setTimeout(r, 100));
    return { data: getStoredCollaborations() };
  },

  getCollaborationById: async (id: string): Promise<{ data: CollaborationProject | null }> => {
    await new Promise((r) => setTimeout(r, 100));
    const list = getStoredCollaborations();
    const item = list.find((c) => c.id === id || c.problemId === id) || list[0] || null;
    return { data: item };
  },

  createCollaboration: async (problemId: string, title: string): Promise<{ data: CollaborationProject }> => {
    const list = getStoredCollaborations();
    const newCollab: CollaborationProject = {
      id: `c-${Date.now().toString().slice(-4)}`,
      problemId,
      title: `${title} (R&D Taskforce)`,
      members: [
        { userId: 'u2', name: 'Dr. Anitha Rao', role: 'Academic Lead', org: 'IIT Madras', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250' },
        { userId: 'u3', name: 'GreenTech Solutions', role: 'Industry Partner', org: 'GreenTech Ltd.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' }
      ],
      stage: 'Prototype Development',
      pipelineStep: 'Collaborate',
      trlLevel: 3,
      progress: 20,
      budget: 4500000,
      tasks: [
        { id: `t-${Date.now()}-1`, title: 'Formulate baseline design & component selection', status: 'In Progress', priority: 'high', assignee: 'Dr. Anitha Rao', dueDate: '2026-09-10' },
        { id: `t-${Date.now()}-2`, title: 'Procure sensor modules and calibration test rig', status: 'To Do', priority: 'medium', assignee: 'GreenTech Solutions', dueDate: '2026-09-24' }
      ],
      files: [],
      discussions: [
        {
          id: `d-${Date.now()}`,
          sender: 'SolutionHub AI Bot',
          senderRole: 'admin',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250',
          content: `Collaboration workspace created for problem #${problemId}. Milestone target: TRL-6 prototype validation.`,
          timestamp: 'Just now'
        }
      ]
    };

    const updated = [newCollab, ...list];
    saveCollaborations(updated);
    return { data: newCollab };
  },

  updateTaskStatus: async (
    collabId: string,
    taskId: string,
    status: WorkspaceTask['status']
  ): Promise<{ data: CollaborationProject | null }> => {
    const list = getStoredCollaborations();
    let updatedCollab: CollaborationProject | null = null;

    const updated = list.map((c) => {
      if (c.id === collabId) {
        const updatedTasks = c.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
        const doneCount = updatedTasks.filter((t) => t.status === 'Done').length;
        const progress = Math.round((doneCount / (updatedTasks.length || 1)) * 100);
        const newTrl = Math.min(9, Math.floor(3 + progress / 14));

        updatedCollab = {
          ...c,
          tasks: updatedTasks,
          progress,
          trlLevel: newTrl,
        };
        return updatedCollab;
      }
      return c;
    });

    saveCollaborations(updated);
    return { data: updatedCollab };
  },

  addTask: async (
    collabId: string,
    task: Omit<WorkspaceTask, 'id'>
  ): Promise<{ data: WorkspaceTask }> => {
    const list = getStoredCollaborations();
    const newTask: WorkspaceTask = {
      ...task,
      id: `t-${Date.now().toString().slice(-4)}`,
    };

    const updated = list.map((c) => {
      if (c.id === collabId) {
        return {
          ...c,
          tasks: [...c.tasks, newTask],
        };
      }
      return c;
    });

    saveCollaborations(updated);
    return { data: newTask };
  },

  addMessage: async (
    collabId: string,
    message: Omit<DiscussionMessage, 'id' | 'timestamp'>
  ): Promise<{ data: DiscussionMessage }> => {
    const list = getStoredCollaborations();
    const newMsg: DiscussionMessage = {
      ...message,
      id: `disc-${Date.now()}`,
      timestamp: 'Just now',
    };

    const updated = list.map((c) => {
      if (c.id === collabId) {
        return {
          ...c,
          discussions: [...c.discussions, newMsg],
        };
      }
      return c;
    });

    saveCollaborations(updated);
    return { data: newMsg };
  },
};
