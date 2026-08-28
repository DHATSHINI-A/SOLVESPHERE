import type { ImpactStats, DeploymentItem } from '../types';
import initialImpactData from '../data/mockData/impactStats.json';
import initialDeploymentsData from '../data/mockData/deployments.json';
import api from './api';

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
    return { data: initialImpactData as unknown as ImpactStats };
  },

  getDeployments: async (): Promise<{ data: DeploymentItem[] }> => {
    // Try fetching live from FastAPI Backend (Member 5)
    try {
      const res = await api.get('/deployment/');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const liveList = res.data.data.map((d: any) => ({
          id: d.id,
          problemId: d.problemId,
          projectTitle: d.projectTitle,
          status: d.status,
          location: d.location,
          unitsDeployed: d.unitsDeployed,
          peopleImpacted: d.beneficiaries,
          dateDeployed: d.deploymentDate,
          partnerOrg: d.organization,
        }));
        return { data: liveList };
      }
    } catch {
      // Backend offline; fallback
    }

    return { data: getStoredDeployments() };
  },

  createDeployment: async (
    deploymentData: Omit<DeploymentItem, 'id' | 'dateDeployed'>
  ): Promise<{ data: DeploymentItem }> => {
    // Try FastAPI Backend (Member 5)
    try {
      await api.post('/deployment/', {
        projectId: deploymentData.problemId || 'c1',
        problemId: deploymentData.problemId || 'p1',
        projectTitle: deploymentData.title || deploymentData.projectTitle || 'Societal Solution',
        status: deploymentData.status || 'Pilot',
        location: deploymentData.location || 'Pilot Site',
        deploymentDate: new Date().toISOString().split('T')[0],
        organization: deploymentData.partnerOrg || 'Taskforce Coalition',
        beneficiaries: deploymentData.peopleImpacted || 5000,
        unitsDeployed: deploymentData.unitsDeployed || 1,
      });
    } catch {
      // Fallback
    }

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
