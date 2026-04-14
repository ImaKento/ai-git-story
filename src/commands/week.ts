import type { Language } from "../types.js";
import { getWeekCommits, getDiff } from "../utils/git.js";
import { generateStory } from "../services/ai.js";

/**
 * week コマンドを実行
 */
export async function runWeekCommand(
  language: Language,
  user?: string,
): Promise<void> {
  if (user) {
    console.log(`📅 過去7日間の ${user} のコミットを取得中...`);
  } else {
    console.log("📅 過去7日間のコミットを取得中...");
  }

  const commits = getWeekCommits(user);

  if (commits.length === 0) {
    console.log("");
    if (user) {
      console.log(`ℹ️  過去7日間に ${user} のコミットがありません`);
    } else {
      console.log("ℹ️  過去7日間にコミットがありません");
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
