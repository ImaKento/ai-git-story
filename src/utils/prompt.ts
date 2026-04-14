import prompts from "prompts";
import { getAllContributors } from "./git.js";

/**
 * ユーザーを選択するインタラクティブUIを表示
 */
export async function selectUser(): Promise<string | undefined> {
  const contributors = getAllContributors();

  if (contributors.length === 0) {
    console.error("❌ リポジトリに貢献者が見つかりませんでした");
    return undefined;
  }

  const choices = [
    { title: "すべてのユーザー", value: "" },
    ...contributors.map((name) => ({ title: name, value: name })),
  ];

  const response = await prompts({
    type: "select",
    name: "user",
    message: "ユーザーを選択してください:",
    choices,
    initial: 0,
  });

  // Ctrl+C などでキャンセルされた場合
  if (response.user === undefined) {
    console.log("\nキャンセルされました");
    process.exit(0);
  }

  return response.user || undefined;
}
