# Palclaw 要件定義

> 作成日: 2026-02-19

## プロダクト概要

**Palclaw** は、学習・目標達成・習慣形成を支援する自律型AIエージェント（Openclaw）を1クリックでデプロイできるプラットフォーム。

参考: https://www.simpleclaw.com/

---

## ユーザーストーリー

1. ユーザーがLPに訪問し、Palclawの価値を理解する
2. 「Deploy Your Palclaw」ボタンからデプロイフローを開始
3. Googleアカウントでサインイン（Supabase Auth）
4. チャネルを選択（Telegram / WhatsApp）
5. AIモデルを選択（Claude Sonnet 4.6 / GPT-4o / Gemini 2.0 Flash）
6. Deployボタンで1クリックデプロイ
7. ダッシュボードでデプロイ状況・進捗を確認
8. Agentsページでエージェント管理
9. Chatsページでチャット履歴確認

---

## Pages

### LP（/）
- ヒーローセクション：キャッチコピー、CTA
- デプロイフロー（ステッパー形式）
  1. チャネル選択: Telegram, WhatsApp（将来: Facebook Messenger, Line）
  2. モデル選択: Claude Sonnet 4.6, GPT-4o, Gemini 2.0 Flash
  3. Googleサインイン → Deploy
- 特徴セクション（1分でデプロイ、学習特化、マルチチャネル）
- 比較テーブル（Palclaw vs 手動セットアップ）

### Dashboard（/dashboard）
- デプロイ状況カード（Running / Deploying / Failed）
- 学習進捗サマリー（セッション数、連続日数）
- 最近のアクティビティ
- クイックアクション（エージェント設定、チャネル追加）

### Agents（/agents）
- エージェント一覧（カード形式）
- エージェント詳細（設定・ステータス・使用チャネル）
- エージェント設定編集（目標・パーソナリティ）

### Chats（/chats）
- チャット履歴一覧（エージェント別）
- チャットセッション表示（将来実装）

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Supabase Auth（Google OAuth） |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Hosting (FE) | Vercel |
| Hosting (Openclaw) | Render（Docker Service） |
| Openclaw | openclaw/openclaw（Docker Image） |

---

## データモデル

### deployments
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| channel | text | telegram / whatsapp |
| model | text | claude / gpt / gemini |
| render_service_id | text | Render service ID |
| render_service_url | text | デプロイURL |
| status | text | pending / deploying / running / failed |
| openclaw_token | text | 認証トークン（暗号化推奨） |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### agents
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| deployment_id | uuid | FK → deployments |
| name | text | エージェント名 |
| personality | text | strict / friendly / motivational |
| goal | text | 学習目標テキスト |
| config | jsonb | 追加設定（将来拡張用） |
| created_at | timestamptz | |

---

## API設計

| Endpoint | Method | 説明 |
|---|---|---|
| /api/deploy | POST | Renderにデプロイリクエスト送信 |
| /api/deploy/[id] | GET | デプロイ状況取得 |
| /api/agents | GET | エージェント一覧取得 |
| /api/agents/[id] | PATCH/DELETE | エージェント更新・削除 |

---

## 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RENDER_API_KEY=
RENDER_OWNER_ID=
RENDER_OPENCLAW_IMAGE=docker.io/openclaw/openclaw:latest
NEXT_PUBLIC_APP_URL=
```

---

## スコープ外（将来対応）

- Facebook Messenger, Line チャネル
- カスタムスキル追加UI
- 使用量・課金管理
- チームプラン
- 独自ドメイン設定
