import type { Language } from "../types.js";
import { getTodayCommits, getDiff } from "../utils/git.js";
import { generateStory } from "../services/ai.js";

/**
 * today コマンドを実行
 */
export async function runTodayCommand(
  language: Language,
  user?: string,
): Promise<void> {
  if (user) {
    console.log(`📅 今日の ${user} のコミットを取得中...`);
  } else {
    console.log("📅 今日のコミットを取得中...");
  }

  const commits = getTodayCommits(user);

  if (commits.length === 0) {
    console.log("");
    if (user) {
      console.log(`ℹ️  今日は ${user} のコミットがありません`);
    } else {
      console.log("ℹ️  今日はまだコミットがありません");
    }
    return;
  }

  // 各コミットのdiffを取得
  for (const commit of commits) {
    commit.diff = getDiff(commit.hash);
  }

  console.log(`✅ ${commits.length} 件のコミットを見つけました`);
  console.log("");

  const story = await generateStory(commits, language);

  console.log("");
  console.log(story);
  console.log("");
}
