# GitStory - 設計書

## 1. プロジェクト概要

### 1.1 コンセプト
GitStoryは、Gitの変更差分を解析し、開発の「物語」として可読性の高いレポートを生成するCLIツールです。
無機質なコミットログやdiffを、人間が読みやすい日記形式のナラティブに変換します。

### 1.2 背景と目的
- **課題**: 日報・週報作成のコスト、「今日何をやったか」の記憶の曖昧さ
- **目的**: 開発者の振り返り支援、チーム内の進捗共有、システム変遷の可視化
- **差別化**: 単なるログ表示ではなく、AIによる「意図」「物語」の抽出

### 1.3 ターゲットユーザー
- 日報・週報を書く必要がある個人開発者
- チーム開発でメンバーの貢献を可視化したいリーダー
- プロジェクトに途中参加し、変遷を把握したいエンジニア

---

## 2. 要件定義

### 2.1 機能要件

#### FR-1: Daily Story Generation (日次レポート生成)
指定した期間のコミットを解析し、日記形式のレポートを出力する。

**出力項目:**
- **Summary**: 一日の成果サマリー（1-2文）
- **Milestones**: 主要な機能追加・設計変更
- **Refactoring**: コード品質向上への貢献
- **Challenges**: デバッグや試行錯誤の痕跡
- **Contributors**: 貢献者とその役割

#### FR-2: Contributor Analysis (貢献者分析)
誰がどのような変更を行ったかを個人単位で集計・要約する。

**出力項目:**
- 個人ごとの変更サマリー
- 得意領域の推測（変更したファイルの種類から）
- 変更量の可視化（質的評価を含む）

#### FR-3: System Timeline (システム変遷)
特定のファイル/ディレクトリの変更履歴を時系列で要約する。

**出力項目:**
- ファイル/ディレクトリの進化の履歴
- 各変更の意図推測
- 主要な設計変更のハイライト

#### FR-4: Flexible Period Selection (柔軟な期間指定)
- 今日、今週、任意の期間（since/until）での集計をサポート

### 2.2 非機能要件

#### NFR-1: パフォーマンス
- 1日分のレポート生成は30秒以内
- 大規模リポジトリ（1000+ commits）でも動作

#### NFR-2: セキュリティ
- ローカルのGitリポジトリのみを対象（外部送信は最小限）
- API keyの安全な管理（環境変数、設定ファイル）

#### NFR-3: ユーザビリティ
- 直感的なCLIインターフェース
- Markdown形式での出力（コピペしやすい）
- ターミナル上でのリッチな表示（色付け、整形）

---

## 3. ユースケース

| ユースケースID | シーン | コマンド例 | 期待される体験 |
|--------------|------|----------|--------------|
| UC-1 | 一日の終わりに振り返り | `ai-git-story today` | 今日の自分の頑張りが日記として出力され、日報にコピペできる |
| UC-2 | 週次ミーティング前の準備 | `ai-git-story week --team` | チーム全体の今週の進捗と設計変更を共有できる |
| UC-3 | 休暇明けのキャッチアップ | `ai-git-story since "3 days ago"` | 不在中の主要な変更と意図を数秒で把握 |
| UC-4 | 特定メンバーの貢献確認 | `ai-git-story stats --user alice` | Aliceさんの今週の貢献を要約形式で表示 |
| UC-5 | ファイルの変遷を追跡 | `ai-git-story trace ./src/auth` | 認証モジュールがどう進化したかの年表を表示 |

---

## 4. CLI コマンド設計

### 4.1 基本構文
```bash
ai-ai-git-story <command> [options]
```

### 4.2 コマンド一覧

#### `ai-ai-git-story today`
**説明**: 今日のコミットからストーリーを生成
**オプション**:
- `--user <name>`: 特定ユーザーの変更のみ
- `--format <markdown|json|html>`: 出力形式
- `--output <file>`: ファイルに保存

**出力例**:
```markdown
# 📖 GitStory - 2026-04-14

## Summary
今日は認証モジュールのリファクタリングと、新しいAPIエンドポイントの追加を行いました。

## Milestones
- ✨ `/api/users` エンドポイントを追加（JWT認証対応）
- ✨ `/api/auth/refresh` エンドポイントを実装
- 🔧 `auth.go` のトークン検証ロジックを改善
- 🔧 セッション管理機能を追加
- 📝 API ドキュメントを更新
- ✅ 認証関連のテストケースを追加

## Refactoring
- `handlers/` 配下のエラーハンドリングを統一
- 冗長な条件分岐を削除（-45 lines）
- 共通のミドルウェア関数を抽出

## Challenges
- トークンのリフレッシュ処理でタイムゾーンの扱いに苦戦

## Contributors
- @imamura: API実装、認証ロジック改善
```

#### `ai-git-story week`
**説明**: 今週（月曜日起算）のストーリーを生成
**オプション**:
- `--team`: チーム全体の集計
- `--group-by <user|file|date>`: グルーピング方法

#### `ai-git-story since <date>`
**説明**: 指定日以降のストーリーを生成
**引数**:
- `<date>`: 日付（例: "2026-04-01", "3 days ago"）

**オプション**:
- `--until <date>`: 終了日

#### `ai-git-story stats`
**説明**: 貢献者統計を表示
**オプション**:
- `--user <name>`: 特定ユーザーのみ
- `--top <n>`: 上位n人を表示

#### `ai-git-story trace <path>`
**説明**: 特定ファイル/ディレクトリの変遷を表示
**引数**:
- `<path>`: ファイルまたはディレクトリのパス

**出力例**:
```markdown
# 📜 File History: src/auth/jwt.go

## 2026-04-14 - @imamura
トークンの有効期限チェックを追加

## 2026-04-10 - @tanaka
JWT生成ロジックを実装

## 2026-04-05 - @imamura
ファイル作成（初期構造）
```

#### `ai-git-story config`
**説明**: 設定の表示・編集
**サブコマンド**:
- `config set <key> <value>`: 設定項目を設定
- `config get <key>`: 設定項目を表示
- `config list`: 全設定を表示

**設定項目**:
- `api.key`: OpenAI/Gemini API Key
- `api.model`: 使用するモデル（例: `gpt-4`, `gemini-pro`）
- `output.format`: デフォルト出力形式
- `output.language`: 出力言語（`ja`, `en`）

---

## 5. 技術スタック

### 5.1 推奨言語
- **Go**: パフォーマンス、シングルバイナリ配布、Git操作の容易さ
- **TypeScript (Node.js)**: 開発速度、LLM SDKの充実

### 5.2 主要ライブラリ（Go版想定）

| 用途 | ライブラリ |
|------|----------|
| CLI Framework | [cobra](https://github.com/spf13/cobra) |
| Git 操作 | [go-git](https://github.com/go-git/go-git) または `exec.Command("git", ...)` |
| AI/LLM | [OpenAI Go SDK](https://github.com/sashabaranov/go-openai) |
| ターミナル表示 | [lipgloss](https://github.com/charmbracelet/lipgloss), [glamour](https://github.com/charmbracelet/glamour) |
| 設定管理 | [viper](https://github.com/spf13/viper) |

### 5.3 主要ライブラリ（TypeScript版想定）

| 用途 | ライブラリ |
|------|----------|
| CLI Framework | [commander](https://github.com/tj/commander.js) |
| Git 操作 | [simple-git](https://github.com/steveukx/git-js) |
| AI/LLM | [OpenAI SDK](https://github.com/openai/openai-node) |
| ターミナル表示 | [chalk](https://github.com/chalk/chalk), [marked-terminal](https://github.com/mikaelbr/marked-terminal) |
| 設定管理 | [conf](https://github.com/sindresorhus/conf) |

---

## 6. システムアーキテクチャ

### 6.1 データフロー

```
┌─────────────────┐
│  CLI Command    │
│  (今日/週/期間) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git Extractor  │ ← git log, git diff
│  (コミット取得) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Diff Parser    │
│  (差分解析)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Orchestrator │ ← OpenAI/Gemini API
│ (要約生成)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Story Formatter │
│ (Markdown生成)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Terminal/File  │
│     Output      │
└─────────────────┘
```

### 6.2 モジュール構成（Go版想定）

```
ai-git-story/
├── cmd/
│   ├── root.go          # ルートコマンド
│   ├── today.go         # todayコマンド
│   ├── week.go          # weekコマンド
│   ├── since.go         # sinceコマンド
│   ├── stats.go         # statsコマンド
│   ├── trace.go         # traceコマンド
│   └── config.go        # configコマンド
├── pkg/
│   ├── git/
│   │   ├── extractor.go # Git情報抽出
│   │   └── parser.go    # Diff解析
│   ├── ai/
│   │   ├── client.go    # LLMクライアント
│   │   └── prompts.go   # プロンプトテンプレート
│   ├── story/
│   │   ├── generator.go # ストーリー生成
│   │   └── formatter.go # 出力整形
│   └── config/
│       └── config.go    # 設定管理
├── main.go
└── go.mod
```

---

## 7. AI プロンプト設計

### 7.1 Daily Story 生成プロンプト（例）

```
あなたはシニアソフトウェアエンジニア兼テクニカルライターです。
以下のGit diffから、開発者の一日の「物語」を日本語で書いてください。

# 制約
- Markdown形式で出力
- 見出しは ## Summary, ## Milestones, ## Refactoring, ## Challenges
- 各セクションは簡潔に（Summary は1-2文）
- 絵文字を適度に使用（✨, 🔧, 🐛 など）

# 入力データ
{コミットログとdiffの内容}

# 出力形式
以下のフォーマットに従ってください:
## Summary
...

## Milestones
- ...

## Refactoring
- ...

## Challenges
- ...
```

### 7.2 Contributor Analysis プロンプト（例）

```
以下は複数の開発者によるコミット履歴です。
各開発者がどのような貢献をしたかを要約してください。

# 制約
- 開発者ごとに3行以内で要約
- 「得意領域」を推測（例: フロントエンド、API設計、テスト）

# 入力データ
{コミットログ（author付き）}
```

---

## 8. 出力形式

### 8.1 Markdown（デフォルト）
- GitHub/Notion/日報ツールにコピペしやすい
- 絵文字、見出し、リストを活用

### 8.2 JSON
- 他ツールとの連携用
- 構造化されたデータ

```json
{
  "date": "2026-04-14",
  "summary": "認証モジュールのリファクタリング...",
  "milestones": [
    "✨ /api/users エンドポイントを追加"
  ],
  "refactoring": [
    "handlers/ のエラーハンドリング統一"
  ],
  "contributors": [
    {
      "name": "imamura",
      "changes": 15,
      "summary": "API実装、認証ロジック改善"
    }
  ]
}
```

### 8.3 HTML
- Webブラウザで表示
- スタイル付きでリッチな表示

---

## 9. 実装フェーズ

### Phase 1: MVP（最小機能）
- [ ] `ai-git-story today` の実装
- [ ] Git log/diff の抽出
- [ ] OpenAI API連携
- [ ] Markdown出力

### Phase 2: 拡張機能
- [ ] `ai-git-story week`, `ai-git-story since` の実装
- [ ] `--user` オプションでの絞り込み
- [ ] 設定ファイル対応（API key管理）

### Phase 3: 高度な分析
- [ ] `ai-git-story stats` の実装
- [ ] `ai-git-story trace` の実装
- [ ] 複数の出力形式（JSON, HTML）

### Phase 4: UX向上
- [ ] インタラクティブモード（TUI）
- [ ] プログレスバー表示
- [ ] キャッシュ機構（同じ期間の再実行を高速化）

---

## 10. 配布・インストール

### 10.1 インストール方法（想定）

**Homebrew (macOS/Linux):**
```bash
brew install ai-git-story
```

**Go install:**
```bash
go install github.com/your-org/ai-git-story@latest
```

**npm (TypeScript版の場合):**
```bash
npm install -g ai-git-story
```

**バイナリ直接ダウンロード:**
```bash
# GitHub Releasesから
curl -L https://github.com/your-org/ai-git-story/releases/latest/download/ai-git-story-linux-amd64 -o ai-git-story
chmod +x ai-git-story
```

---

## 11. 今後の拡張性

### 11.1 チーム向け機能
- Slack/Discord への自動投稿
- GitHub Actions での自動レポート生成
- Notion/Confluence への自動同期

### 11.2 パーソナライゼーション
- ユーザーごとの文体カスタマイズ
- 「褒めてくれる」「厳しくフィードバック」などのモード切替

### 11.3 分析の高度化
- コード複雑度の変化検出
- バグ混入リスクの推測
- 技術的負債の蓄積アラート

---

## 12. 参考資料・インスピレーション

- **GitLens** (VS Code Extension): コミット履歴の可視化
- **git-standup**: 自分の昨日の作業を表示するシンプルなツール
- **GitHub Copilot Workspace**: AIによるコード理解とサマリー生成

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-04-14 | 1.0 | 初版作成 |
