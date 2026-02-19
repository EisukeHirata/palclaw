# Palclaw MVP TODO

> 更新日: 2026-02-19

## Phase 1: プロジェクトセットアップ ✅

- [x] requirements.md 作成
- [x] todo.md 作成
- [x] Next.js 16 プロジェクト初期化（App Router + TypeScript）
- [x] shadcn/ui コンポーネント追加（Button, Card, Badge, Progress, Tabs, Separator）
- [x] 環境変数設定（.env.local.example）
- [x] pnpm install + ビルド成功確認

## Phase 2: データベース・認証 ✅

- [x] Supabase マイグレーション作成（deployments, agents テーブル）
- [x] RLS ポリシー設定（全CRUD）
- [x] Supabase クライアント実装（client.ts, server.ts, middleware.ts）
- [x] Google OAuth コールバック（/auth/callback）
- [x] サインアウト（/auth/signout）

## Phase 3: LP（Landing Page）✅

- [x] Navbar（認証状態に応じたリンク）
- [x] HeroSection（キャッチコピー、CTA）
- [x] DeployFlow（3ステップ: チャネル→モデル→Deploy）
  - [x] Step 1: チャネル選択（Telegram, WhatsApp）
  - [x] Step 2: モデル選択（Claude, GPT, Gemini）
  - [x] Step 3: Googleサインイン & Deploy
- [x] FeaturesSection（6機能カード）
- [x] ComparisonTable（Palclaw vs 手動セットアップ）
- [x] Footer

## Phase 4: API ✅

- [x] POST /api/deploy（Render API連携）
- [x] GET /api/deploy/[id]（ステータス確認・ポーリング）
- [x] GET /api/agents（一覧）
- [x] POST /api/agents（作成）
- [x] PATCH /api/agents/[id]（更新）
- [x] DELETE /api/agents/[id]（削除）

## Phase 5: Dashboard ✅

- [x] 統計カード（Running/Deploying/Agents/Streak）
- [x] デプロイ一覧（ステータスバッジ、URL表示）
- [x] デプロイ中のプログレスバー + 自動ポーリング
- [x] クイックアクション

## Phase 6: Agents ページ ✅

- [x] エージェント一覧（カード形式）
- [x] 新規エージェント作成フォーム
- [x] パーソナリティ選択（Friendly / Strict / Motivational）
- [x] エージェント編集・削除

## Phase 7: Chats ページ ✅

- [x] デプロイ一覧（チャネル別）
- [x] Openclaw Dashboard リンク

## Phase 8: デプロイ設定 ✅

- [x] vercel.json
- [x] README.md
- [x] pnpm build 成功

---

## 残タスク（次フェーズ）

- [ ] Supabase プロジェクト作成 & 環境変数設定
- [ ] Render アカウント設定 & API Key取得
- [ ] Google OAuth 設定（Supabase側）
- [ ] Vercel デプロイ
- [ ] E2Eテスト
