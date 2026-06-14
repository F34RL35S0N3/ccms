export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEAM_LEADER" | "MEMBER";
  image: string | null;
  nim: string | null;
  faculty: string | null;
  skills: string[];
  password?: string | null;
}

export interface Competition {
  id: string;
  name: string;
  organizer: string;
  website: string | null;
  level: "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
  category: CompetitionCategory;
  description: string | null;
  prizePool: string | null;
  certificate: boolean;
  funding: boolean;
  incubation: boolean;
  status: CompetitionStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  stages: CompetitionStage[];
  timeline: CompetitionTimeline[];
  tasks: Task[];
  deadlines: Deadline[];
  teamMembers: TeamMember[];
  documents: Document[];
  results: CompetitionResult | null;
}

export type CompetitionCategory =
  | "HACKATHON"
  | "CTF"
  | "RESEARCH"
  | "PAPER_COMPETITION"
  | "INNOVATION_COMPETITION"
  | "BUSINESS_CASE"
  | "TECHNOLOGY_COMPETITION";

export type CompetitionStatus =
  | "MONITORING"
  | "REGISTRATION"
  | "SELECTION_PROPOSAL"
  | "SEMIFINAL"
  | "FINAL"
  | "FINISHED"
  | "WON"
  | "ELIMINATED";

export interface CompetitionStage {
  id: string;
  name: string;
  order: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}

export interface CompetitionTimeline {
  id: string;
  title: string;
  date: Date;
  type: "DEADLINE" | "MEETING" | "PRESENTATION" | "SUBMISSION" | "MILESTONE" | "OTHER";
  description: string | null;
}

export interface TeamMember {
  id: string;
  userId: string;
  role: "LEADER" | "CO_LEADER" | "MEMBER" | "MENTOR";
  joinedAt: Date;
  user: User;
}

export interface Task {
  id: string;
  competitionId: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assigneeId: string | null;
  assignee: User | null;
  dueDate: Date | null;
  createdAt: Date;
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface Deadline {
  id: string;
  competitionId: string;
  competition: Competition;
  title: string;
  type: "REGISTRATION" | "PROPOSAL" | "SUBMISSION" | "PRESENTATION" | "FINAL_ROUND" | "OTHER";
  date: Date;
  description: string | null;
  daysRemaining: number;
}

export interface Document {
  id: string;
  competitionId: string | null;
  uploadedBy: string;
  user: User;
  name: string;
  type: "PROPOSAL" | "PAPER" | "PPT" | "SOURCE_CODE" | "DATASET" | "REFERENCES" | "OTHER";
  url: string;
  size: number | null;
  version: number;
  createdAt: Date;
}

export interface CompetitionResult {
  id: string;
  competitionId: string;
  placement: string | null;
  score: number | null;
  feedback: string | null;
  certificateUrl: string | null;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: "TIPS" | "STRATEGY" | "TEMPLATE" | "LESSONS_LEARNED" | "EVALUATION" | "GENERAL";
  tags: string[];
  authorId: string;
  author: User;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: User;
  competitionId: string | null;
  competition: Competition | null;
  action: string;
  details: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "DEADLINE" | "TASK" | "COMPETITION" | "SYSTEM" | "MENTION";
  read: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalActiveCompetitions: number;
  totalFinishedCompetitions: number;
  weeklyDeadlines: number;
  totalActiveMembers: number;
  overallProgress: number;
}
