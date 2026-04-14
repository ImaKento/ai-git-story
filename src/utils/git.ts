import { execSync } from "child_process";
import type { CommitInfo, ContributorStats } from "../types.js";

/**
 * Git コマンドを実行
 */
function execGit(command: string): string {
  try {
    return execSync(`git ${command}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 指定期間のコミット履歴を取得
 */
export function getCommits(
  since?: string,
  until?: string,
  author?: string,
): CommitInfo[] {
  let command = 'log --pretty=format:"%H|%an|%ad|%s" --date=iso';

  if (since) {
    command += ` --since="${since}"`;
  }
  if (until) {
    command += ` --until="${until}"`;
  }
  if (author) {
    command += ` --author="${author}"`;
  }

  const output = execGit(command);
  if (!output) {
    return [];
  }

  const lines = output.split("\n");
  return lines.map((line) => {
    const [hash, author, dateStr, message] = line.split("|");
    return {
      hash,
      author,
      date: new Date(dateStr),
      message,
      diff: "",
    };
  });
}

/**
 * 特定のコミットのdiffを取得
 */
export function getDiff(hash: string): string {
  try {
    return execGit(`show ${hash} --format="" --unified=3`);
  } catch {
    return "";
  }
}

/**
 * 今日のコミットを取得
 */
export function getTodayCommits(author?: string): CommitInfo[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = today.toISOString();
  return getCommits(since, undefined, author);
}

/**
 * 過去7日間のコミットを取得
 */
export function getWeekCommits(author?: string): CommitInfo[] {
  return getCommits("1 week ago", undefined, author);
}

/**
 * 特定のファイル/ディレクトリの履歴を取得
 */
export function getFileHistory(filePath: string): CommitInfo[] {
  const command = `log --pretty=format:"%H|%an|%ad|%s" --date=iso -- ${filePath}`;
  const output = execGit(command);
  if (!output) {
    return [];
  }

  const lines = output.split("\n");
  return lines.map((line) => {
    const [hash, author, dateStr, message] = line.split("|");
    return {
      hash,
      author,
      date: new Date(dateStr),
      message,
      diff: getDiff(hash),
    };
  });
}

/**
 * diffから統計情報を抽出
 */
function parseDiffStats(diff: string): {
  additions: number;
  deletions: number;
  filesChanged: number;
} {
  const lines = diff.split("\n");
  let additions = 0;
  let deletions = 0;
  const files = new Set<string>();

  for (const line of lines) {
    // ファイル名を抽出
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/(.+) b\/.+/);
      if (match) {
        files.add(match[1]);
      }
    }
    // 追加行をカウント（+++ は除外）
    else if (line.startsWith("+") && !line.startsWith("+++")) {
      additions++;
    }
    // 削除行をカウント（--- は除外）
    else if (line.startsWith("-") && !line.startsWith("---")) {
      deletions++;
    }
  }

  return {
    additions,
    deletions,
    filesChanged: files.size,
  };
}

/**
 * コミッターの統計を取得
 */
export function getContributorStats(
  commits: CommitInfo[],
): ContributorStats[] {
  const statsMap = new Map<
    string,
    {
      commits: number;
      additions: number;
      deletions: number;
      filesChanged: number;
    }
  >();

  for (const commit of commits) {
    const current = statsMap.get(commit.author) || {
      commits: 0,
      additions: 0,
      deletions: 0,
      filesChanged: 0,
    };

    const diffStats = parseDiffStats(commit.diff);

    statsMap.set(commit.author, {
      commits: current.commits + 1,
      additions: current.additions + diffStats.additions,
      deletions: current.deletions + diffStats.deletions,
      filesChanged: current.filesChanged + diffStats.filesChanged,
    });
  }

  // Map を ContributorStats[] に変換
  return Array.from(statsMap.entries()).map(([name, stats]) => ({
    name,
    commits: stats.commits,
    additions: stats.additions,
    deletions: stats.deletions,
    filesChanged: stats.filesChanged,
    totalChanges: stats.additions + stats.deletions,
  }));
}

/**
 * リポジトリ内の全貢献者リストを取得
 */
export function getAllContributors(): string[] {
  try {
    const output = execGit("log --format='%an' --all");
    if (!output) {
      return [];
    }
    const contributors = output
      .split("\n")
      .map((name) => name.replace(/^'|'$/g, "").trim())
      .filter(Boolean);
    // 重複を削除してソート
    return Array.from(new Set(contributors)).sort();
  } catch {
    return [];
  }
}
