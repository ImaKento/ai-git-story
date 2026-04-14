import type { Language } from "../types.js";
import { getTodayCommits, getDiff, getCommits } from "../utils/git.js";
import { generateStory } from "../services/ai.js";

/**
 * today コマンドを実行
 */
export async function runTodayCommand(
  language: Language,
  user?: string,
  since?: string,
  until?: string,
): Promise<void> {
  // 期間が指定されている場合は getCommits を使用
  let commits;
  if (since || until) {
    const period = since || "today";
    if (user) {
      console.log(`📅 ${period} 以降の ${user} のコミットを取得中...`);
    } else {
      console.log(`📅 ${period} 以降のコミットを取得中...`);
    }
    commits = getCommits(period, until, user);
  } else {
    if (user) {
      console.log(`📅 今日の ${user} のコミットを取得中...`);
    } else {
      console.log("📅 今日のコミットを取得中...");
    }
    commits = getTodayCommits(user);
  }

  if (commits.length === 0) {
    console.log("");
    if (since || until) {
      if (user) {
        console.log(`ℹ️  指定期間内に ${user} のコミットが見つかりませんでした`);
      } else {
        console.log("ℹ️  指定期間内にコミットが見つかりませんでした");
      }
    } else {
      if (user) {
        console.log(`ℹ️  今日は ${user} のコミットがありません`);
      } else {
        console.log("ℹ️  今日はまだコミットがありません");
      }
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
