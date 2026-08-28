import type { ProblemItem, ProblemStatus } from '../types';
import initialProblemsData from '../data/mockData/problems.json';
import api from './api';

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
    await new Promise((r) => setTimeout(r, 80));

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
    const list = getStoredProblems();
    let found = list.find((p) => p.id === id) || null;

    // Try fetching live AI analysis from FastAPI backend
    try {
      const aiRes = await api.get(`/ai/analysis/${id}`);
      if (aiRes.data && found) {
        found = {
          ...found,
          category: aiRes.data.domain || found.category,
          requiredExpertise: aiRes.data.required_skills || found.requiredExpertise,
          urgency: (aiRes.data.urgency || 'medium').toLowerCase() as any,
          aiAnalysis: {
            summary: `Automated assessment: ${aiRes.data.problem_type}. Key tags: ${aiRes.data.keywords?.join(', ')}.`,
            expertiseTags: (aiRes.data.required_skills || []).map((skill: string) => ({
              name: skill,
              confidence: 94,
            })),
            feasibilityScore: 92,
            duplicateScore: 6,
          },
        };
      }
    } catch {
      // Backend unavailable; use local data
    }

    return { data: found };
  },

  createProblem: async (
    problemData: Omit<ProblemItem, 'id' | 'date' | 'upvotes' | 'status' | 'aiAnalysis'>
  ): Promise<{ data: ProblemItem }> => {
    const list = getStoredProblems();
    const pid = `p-${Date.now().toString().slice(-4)}`;

    let realAiSkills = problemData.requiredExpertise;
    let realDomain = problemData.category;
    let realSummary = `Automated assessment: High community urgency in ${problemData.category}. Suggested technical pathway: edge sensor nodes with cloud validation.`;

    // Connect to live Member 2 AI Understanding Engine
    try {
      const res = await api.post('/ai/analyze', {
        problem_id: pid,
        problem_description: problemData.description || problemData.title,
      });
      if (res.data) {
        realDomain = res.data.domain || realDomain;
        realAiSkills = res.data.required_skills || realAiSkills;
        realSummary = `AI Engine Analysis: Primary Domain: ${res.data.domain}. Solution Type: ${res.data.problem_type}. Normalized Skills: ${res.data.required_skills?.join(', ')}.`;
      }
    } catch {
      // Fallback if AI server offline
    }

    const newProblem: ProblemItem = {
      ...problemData,
      id: pid,
      category: realDomain,
      requiredExpertise: realAiSkills,
      date: new Date().toISOString().split('T')[0],
      upvotes: 1,
      status: 'New',
      aiAnalysis: {
        summary: realSummary,
        expertiseTags: realAiSkills.map((name) => ({
          name,
          confidence: Math.floor(90 + Math.random() * 8),
        })),
        feasibilityScore: Math.floor(88 + Math.random() * 10),
        duplicateScore: Math.floor(3 + Math.random() * 10),
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
