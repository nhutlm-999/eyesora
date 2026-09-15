export interface SeverityBreakdown {
  mild: number;
  moderate: number;
  severe: number;
}

export interface GradeStats {
  gradeId: string;
  gradeName: string;
  totalExamined: number;
  myopiaCount: number;
  myopiaRate: number;
  severityBreakdown: SeverityBreakdown;
  alertCount: number;
}

