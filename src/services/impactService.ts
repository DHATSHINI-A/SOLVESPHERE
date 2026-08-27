import type { ImpactStats, DeploymentItem } from '../types';
import initialImpactData from '../data/mockData/impactStats.json';
import initialDeploymentsData from '../data/mockData/deployments.json';

const STORAGE_KEY = 'sih_deployments_data';

const getStoredDeployments = (): DeploymentItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialDeploymentsData as unknown as DeploymentItem[];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDeploymentsData));
  return initialDeploymentsData as unknown as DeploymentItem[];
};

export const impactService = {
  getStats: async (): Promise<{ data: ImpactStats }> => {
    await new Promise((r) => setTimeout(r, 100));
    return { data: initialImpactData as unknown as ImpactStats };
  },

  getDeployments: async (): Promise<{ data: DeploymentItem[] }> => {
    await new Promise((r) => setTimeout(r, 100));
    return { data: getStoredDeployments() };
  },

  createDeployment: async (
    deploymentData: Omit<DeploymentItem, 'id' | 'dateDeployed'>
  ): Promise<{ data: DeploymentItem }> => {
    const list = getStoredDeployments();
    const newDep: DeploymentItem = {
      ...deploymentData,
      id: `dep-${Date.now().toString().slice(-4)}`,
      dateDeployed: new Date().toISOString().split('T')[0],
    };

    const updated = [newDep, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { data: newDep };
  },
};
