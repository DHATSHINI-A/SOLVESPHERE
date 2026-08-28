import type { ProblemItem, ProblemStatus } from '../types';
import initialProblemsData from '../data/mockData/problems.json';

const STORAGE_KEY = 'sih_problems_data';

const getStoredProblems = (): ProblemItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialProblemsData as ProblemItem[];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProblemsData));
  return initialProblemsData as ProblemItem[];
};

const saveProblems = (data: ProblemItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const problemService = {
  getProblems: async (params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ProblemItem[]; total: number }> => {
    // Simulated network latency
    await new Promise((r) => setTimeout(r, 120));

    let list = getStoredProblems();

    if (params?.category && params.category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.requiredExpertise.some((e) => e.toLowerCase().includes(q))
      );
    }

    return {
      data: list,
      total: list.length,
    };
  },

  getProblemById: async (id: string): Promise<{ data: ProblemItem | null }> => {
    await new Promise((r) => setTimeout(r, 100));
    const list = getStoredProblems();
    const found = list.find((p) => p.id === id) || null;
    return { data: found };
  },

  createProblem: async (
    problemData: Omit<ProblemItem, 'id' | 'date' | 'upvotes' | 'status' | 'aiAnalysis'>
  ): Promise<{ data: ProblemItem }> => {
    await new Promise((r) => setTimeout(r, 200));
    const list = getStoredProblems();
    
    // Generate AI analysis
    const newProblem: ProblemItem = {
      ...problemData,
      id: `p-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      upvotes: 1,
      status: 'New',
      aiAnalysis: {
        summary: `Automated assessment: High community urgency in ${problemData.category}. Suggested technical pathway: edge sensor nodes with cloud validation.`,
        expertiseTags: problemData.requiredExpertise.map((name) => ({
          name,
          confidence: Math.floor(88 + Math.random() * 10),
        })),
        feasibilityScore: Math.floor(85 + Math.random() * 12),
        duplicateScore: Math.floor(4 + Math.random() * 12),
      },
    };

    const updated = [newProblem, ...list];
    saveProblems(updated);
    return { data: newProblem };
  },

  updateProblemStatus: async (
    id: string,
    status: ProblemStatus
  ): Promise<{ data: ProblemItem | null }> => {
    await new Promise((r) => setTimeout(r, 100));
    const list = getStoredProblems();
    let updatedItem: ProblemItem | null = null;

    const updated = list.map((p) => {
      if (p.id === id) {
        updatedItem = { ...p, status };
        return updatedItem;
      }
      return p;
    });

    saveProblems(updated);
    return { data: updatedItem };
  },

  upvoteProblem: async (id: string): Promise<{ data: ProblemItem | null }> => {
    const list = getStoredProblems();
    let updatedItem: ProblemItem | null = null;

    const updated = list.map((p) => {
      if (p.id === id) {
        updatedItem = { ...p, upvotes: p.upvotes + 1 };
        return updatedItem;
      }
      return p;
    });

    saveProblems(updated);
    return { data: updatedItem };
  },
};
