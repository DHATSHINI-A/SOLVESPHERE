export type Role = 'citizen' | 'university' | 'industry' | 'admin' | 'guest';

export type Sector = 
  | 'Water'
  | 'Water & Sanitation'
  | 'Agriculture' 
  | 'Clean Energy'
  | 'Energy'
  | 'Smart Cities' 
  | 'Waste Management'
  | 'Waste'
  | 'Healthcare'
  | 'Health'
  | 'EdTech'
  | 'Education'
  | 'Cybersecurity' 
  | 'Disaster Management'
  | string;

export type ProblemStatus = 
  | 'New' 
  | 'Verified' 
  | 'Matched' 
  | 'In Collaboration' 
  | 'Prototype Ready' 
  | 'Deployed' 
  | 'Rejected'
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'in_collaboration'
  | 'prototype_ready'
  | 'deployed'
  | 'rejected';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  location?: string;
  organization?: string;
  org?: string;
  sector?: string;
  department?: string;
  companyName?: string;
  avatar: string;
  reputationPoints: number;
}

export interface ExpertiseTag {
  name: string;
  confidence: number;
}

export interface AIAnalysisResult {
  summary: string;
  expertiseTags: ExpertiseTag[];
  feasibilityScore: number;
  duplicateScore: number;
}

export interface ProblemItem {
  id: string;
  title: string;
  category: string;
  sector?: string;
  description: string;
  status: ProblemStatus;
  location: string;
  submittedBy: string;
  submitterName?: string;
  date: string;
  upvotes: number;
  urgency: UrgencyLevel;
  requiredExpertise: string[];
  targetBeneficiaries?: string;
  estimatedBudgetReq?: number;
  sdgGoal?: number;
  aiAnalysis?: AIAnalysisResult;
}

export interface MatchedPartner {
  id: string;
  orgId: string;
  type: 'university' | 'industry' | 'researcher';
  name: string;
  matchScore: number;
  matchedExpertise: string[];
  pastProjectCount: number;
  location: string;
  labLead?: string;
  trlLevel?: number;
  availableEquipment?: string;
  csrBudget?: number;
  offerType?: string;
}

export interface MatchResult {
  problemId: string;
  matchScore: number;
  matchingSummary?: string;
  partners: MatchedPartner[];
}

export interface WorkspaceTask {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  date: string;
}

export interface DiscussionMessage {
  id: string;
  sender?: string;
  senderName?: string;
  senderRole?: Role;
  role?: Role;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface CollaborationProject {
  id: string;
  problemId: string;
  title: string;
  members: {
    userId: string;
    name: string;
    role: string;
    org: string;
    avatar: string;
  }[];
  stage: string;
  pipelineStep: 'Problem' | 'Understand' | 'Match' | 'Collaborate' | 'Build' | 'Deploy' | 'Impact' | string;
  trlLevel: number;
  progress: number;
  budget: number;
  tasks: WorkspaceTask[];
  files: WorkspaceFile[];
  discussions: DiscussionMessage[];
}

export interface DeploymentItem {
  id: string;
  problemId: string;
  title?: string;
  projectTitle?: string;
  sector?: string;
  status: 'Planned' | 'In Progress' | 'Live' | 'online' | 'warning' | 'offline' | string;
  deployedBy?: string;
  partnerOrg?: string;
  location: string;
  region?: string;
  unitsDeployed?: number;
  dateDeployed?: string;
  deploymentDate?: string;
  peopleImpacted?: number;
  beneficiariesCount?: number;
  metrics?: Record<string, any>;
  liveMetrics?: Array<{ metricName: string; value: string; trend: 'up' | 'down' | 'stable' }>;
  impactRating?: number;
}

export interface ImpactStats {
  totalProblems: number;
  verifiedProblems: number;
  activeCollaborations: number;
  solutionsDeveloped: number;
  solutionsDeployed: number;
  peopleImpacted: number;
  successRate: number;
  pipelineFunnel: { stage: string; count: number; color: string }[];
  growthByMonth: { month: string; problems: number; solutions: number }[];
  categoryBreakdown: { category: string; count: number; color: string }[];
  solutionsByRegion: { region: string; deployed: number; collaborations: number }[];
  successStories: {
    id: string;
    title: string;
    partner: string;
    category: string;
    impact: string;
    image: string;
    quote: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'ai_match';
}

// Aliases for legacy files
export type ProblemStatement = ProblemItem;
export type AIMatch = MatchResult;
export type PlatformMetrics = ImpactStats;
