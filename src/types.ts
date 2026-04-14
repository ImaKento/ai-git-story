export type Language = "ja" | "en";

export interface Config {
  language: Language;
  apiKey?: string;
  model?: string;
}

export interface CommitInfo {
  hash: string;
  author: string;
  date: Date;
  message: string;
  diff: string;
}

export interface StorySection {
  summary?: string;
  milestones?: string[];
  refactoring?: string[];
  challenges?: string[];
  contributors?: ContributorInfo[];
}

export interface ContributorInfo {
  name: string;
  changes: number;
  summary: string;
}

export interface FileHistory {
  path: string;
  changes: {
    date: Date;
    author: string;
    summary: string;
  }[];
}

export interface ContributorStats {
  name: string;
  commits: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  totalChanges: number;
}
