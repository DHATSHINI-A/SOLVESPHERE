import type {
  ProblemStatement,
  AIMatch,
  CollaborationProject,
  DeploymentItem,
  PlatformMetrics,
  User,
} from '../types';
import usersMock from './mockData/users.json';
import problemsMock from './mockData/problems.json';
import matchesMock from './mockData/matches.json';
import collaborationsMock from './mockData/collaborations.json';
import deploymentsMock from './mockData/deployments.json';
import impactStatsMock from './mockData/impactStats.json';

export const initialUsers: User[] = usersMock as User[];
export const initialProblems: ProblemStatement[] = problemsMock as unknown as ProblemStatement[];
export const initialAIMatches: AIMatch[] = matchesMock as unknown as AIMatch[];
export const initialProjects: CollaborationProject[] = collaborationsMock as unknown as CollaborationProject[];
export const initialDeployments: DeploymentItem[] = deploymentsMock as unknown as DeploymentItem[];
export const initialMetrics: PlatformMetrics = impactStatsMock as unknown as PlatformMetrics;
