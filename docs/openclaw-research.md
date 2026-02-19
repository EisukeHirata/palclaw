# OpenClaw 技術調査レポート

> 調査日: 2026-02-17

## 概要

**OpenClaw**（旧名: Clawdbot → Moltbot → OpenClaw）は、Peter Steinberger氏が2025年11月に開発・公開した**オープンソースの自律型AIエージェントプラットフォーム**。ローカルで動作するセルフホスト型のパーソナルAIアシスタント。

- **公式サイト**: https://openclaw.ai/
- **ドキュメント**: https://docs.openclaw.ai/
- **GitHub**: https://github.com/openclaw/openclaw（180,000+ stars）
- **ライセンス**: MIT License

---

## Docker構成・デプロイ

### システム要件
- Node.js 22+
- Docker & Docker Compose
- RAM 2GB+（4GB推奨）
- ディスク 10GB+

### クイックインストール
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw channels login
openclaw gateway --port 18789
```

### Docker デプロイ
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
./docker-setup.sh
```

### 構成ポイント
- マウントボリューム: `~/.openclaw`（設定）+ `~/openclaw/workspace`（エージェント用）
- Web UI: ポート **18789** (`http://localhost:18789`)、`?token=` パラメータ認証
- サンドボックス実行: Docker内で隔離

---

## API仕様

### アーキテクチャ
ハブ＆スポーク型。中央の**Gateway**がセッション、ルーティング、チャネル接続を一元管理。

### WebSocket API
- エンドポイント: `ws://127.0.0.1:18789`
- TypeBox バリデーション付き WebSocket RPC
- リアルタイムメッセージ、セッション管理、ダッシュボード更新

### エージェント管理
- マルチエージェントルーティング（チャネル/アカウント/ピアごとに隔離）
- 各エージェントが独自のワークスペース、認証、セッション、チャネルバインディングを持つ

### Webhook
- `POST /hooks/agent` でWebhook受信
- Cronジョブ、Gmail Pub/Sub統合

---

## メモリ・スキル拡張

### スキルシステム
YAMLフロントマター付きMarkdownファイルで定義。優先度:

```
<workspace>/skills/       ← 最高優先度
~/.openclaw/skills/       ← 中間
bundled skills            ← 最低優先度
```

### コミュニティスキル
- **ClawHub**: 5,705+ のコミュニティ製スキル
- GitHub: `openclaw/skills` リポジトリ

### メモリ
| スキル名 | 概要 |
|---|---|
| Hippocampus Memory | 構造化永続メモリ、重要度スコアリング |
| Better Memory | セマンティックメモリ、エンベディングベース |
| Agent Memory | 事実記憶、経験学習、エンティティ追跡 |

### 組み込みメモリファイル
- `MEMORY.md`: 長期記憶
- `USER.md`: ユーザー情報

---

## カスタマイズ方法（Wrapper設計に重要）

### ワークスペース構造
```
~/.openclaw/workspace/
├── AGENTS.md      # エージェント定義・ルーティング
├── SOUL.md        # パーソナリティ・トーン・行動境界
├── USER.md        # ユーザー情報
├── TOOLS.md       # ツール設定
├── HEARTBEAT.md   # 定期チェックインスケジュール
├── MEMORY.md      # 長期記憶
├── memory/        # メモリストア
└── skills/        # カスタムスキル
```

### SOUL.md（パーソナリティ定義）
- エージェントのアイデンティティ、トーン、行動境界をMarkdownで定義
- 推奨: 50-150行
- 変更後にエージェント再起動で即反映

→ **Claw-senseiでは、テーマ・性格設定に応じてSOUL.mdを動的生成する**

### HEARTBEAT.md
→ **復習リマインダー、進捗レポート自動生成に活用可能**

---

## Claw-senseiとの統合設計メモ

### Wrapperの役割
1. **SOUL.md動的生成**: テーマ（語学、資格等）+ 性格（厳格、優しい等）→ SOUL.md生成
2. **スキル注入**: 学習特化スキル（復習、進捗管理、弱点分析）をskills/に配置
3. **HEARTBEAT.md設定**: 定期的なコーチング・リマインダーをスケジュール
4. **USER.md初期化**: ユーザーの目標・期限・現在レベルを記載
5. **MEMORY.md**: 学習進捗、セッション要約を蓄積

### コンテナ隔離
- ユーザーごとに独立Dockerコンテナ
- ネットワーク分離（Dockerネットワーク）
- リソース制限（CPU 0.5-1コア、メモリ2-4GB）

### セキュリティ対策（必須）
- 認証トークン必須化
- 信頼できるスキルのみ使用（ClawHub無効化 or ホワイトリスト）
- ツール制限（ファイル削除、メール送信等をデフォルト無効）
- Gatewayを外部に直接公開しない（Next.js API経由でプロキシ）
- 最新バージョン（2026.2.12+）を使用

### 既知のセキュリティリスク
- プロンプトインジェクション（外部コンテンツ処理時）
- WebSocketオリジン未検証（→ 最新版で修正済み）
- 悪意あるスキル（→ カスタムスキルのみ使用で回避）
- 公開インスタンスのリスク（→ 認証必須 + プロキシで対応）

---

## 対応AIプロバイダ
- Anthropic（Claude）← 推奨
- OpenAI（ChatGPT/Codex）
- DeepSeek

→ requirements.mdの「Claude 3.5 Sonnet / Gemini / OpenAI / Grok-2」と整合

---

## 参考リンク
- https://github.com/openclaw/openclaw
- https://docs.openclaw.ai/
- https://docs.openclaw.ai/install/docker
- https://docs.openclaw.ai/tools/skills
- https://docs.openclaw.ai/gateway/security
