import type { MatchResult } from '../types';
import initialMatchesData from '../data/mockData/matches.json';

const STORAGE_KEY = 'sih_matches_data';

const getStoredMatches = (): MatchResult[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialMatchesData as MatchResult[];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMatchesData));
  return initialMatchesData as MatchResult[];
};

export const matchService = {
  getMatchesByProblemId: async (problemId: string): Promise<{ data: MatchResult | null }> => {
    await new Promise((r) => setTimeout(r, 120));
    const list = getStoredMatches();
    const match = list.find((m) => m.problemId === problemId);

    if (match) {
      return { data: match };
    }

    // Dynamic generation if not found in mock
    const generated: MatchResult = {
      problemId,
      matchScore: 92,
      matchingSummary: 'Generated automated match: Pairs regional academic robotics & environmental labs with CSR clean-technology sponsors.',
      partners: [
        {
          id: `gen-p1-${Date.now()}`,
          orgId: 'u2',
          type: 'university',
          name: 'IIT Madras R&D Cell',
          matchScore: 95,
          matchedExpertise: ['Applied Engineering', 'IoT Prototyping', 'Sensory Mesh'],
          pastProjectCount: 16,
          location: 'Chennai, Tamil Nadu',
          labLead: 'Dr. Anitha Rao',
          trlLevel: 6,
          availableEquipment: 'Rapid Prototyping Lab & Fabrication Unit',
        },
        {
          id: `gen-p2-${Date.now()}`,
          orgId: 'u3',
          type: 'industry',
          name: 'GreenTech Solutions Ltd.',
          matchScore: 90,
          matchedExpertise: ['Manufacturing', 'Field Deployment', 'CSR Grant Support'],
          pastProjectCount: 9,
          location: 'Coimbatore, Tamil Nadu',
          csrBudget: 5000000,
          offerType: 'Co-funding & Hardware Fabrication',
        },
      ],
    };

    return { data: generated };
  },

  getAllMatches: async (): Promise<{ data: MatchResult[] }> => {
    await new Promise((r) => setTimeout(r, 100));
    return { data: getStoredMatches() };
  },

  invitePartner: async (
    problemId: string,
    partnerId: string
  ): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 150));
    return {
      success: true,
      message: `Collaboration invitation sent to partner (${partnerId}) for problem statement #${problemId}.`,
    };
  },
};
