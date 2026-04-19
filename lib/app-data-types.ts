export type TeachingResource = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  likes: number;
  likedByMe: boolean;
  /** ISO date added */
  createdAt: string;
};

export type WorkloadRiskLevel = "low" | "medium" | "high";

export type ExecutiveWorkloadRow = {
  id: string;
  dept: string;
  teachingHours: number;
  additionalTasksHours: number;
  engagementScore: number;
  riskLevel: WorkloadRiskLevel;
};
