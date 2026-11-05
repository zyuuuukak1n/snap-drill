# スナップドリル (SnapDrill) ✏️💮

[![CI](https://github.com/zyuuuukak1n/snap-drill/actions/workflows/main.yml/badge.svg)](https://github.com/zyuuuukak1n/snap-drill/actions/workflows/main.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

小学生向けテスト復習・手書き学習Webアプリケーション（PWA対応）。  
採点済みプリントの写真を撮影またはアップロードするだけで、Gemini Vision APIが元の印刷問題と模範解答を自動抽出。学校配布のChromebook上でスタイラスペンや指による手書き反復練習・特訓ができます。

---

## ✨ 主な機能

1. **プリント自動問題化（Gemini Vision）**
   - 採点済みプリントの赤ペン丸付けや子供の手書きを無視し、元の印刷問題と模範解答を自動抽出。
   - 5教科（国語・算数・理科・社会・英語）を自動判定。
2. **Chromebook最適化・手書きCanvas**
   - パームリジェクション（`touch-action: none;`）による誤タッチ防止。
   - スタイラスペン・筆圧対応、黒・赤・青ペン、太さ変更、Undo、一括クリア。
   - 国語・漢字向けの「十字リーダー（点線マス目）」表示。
3. **自己申告・めくり方式の採点UX**
   - 「こたえをみる」で模範解答がフリップオープン。
   - 「できた！💮」で花丸スタンプアニメーション＋紙吹雪（`canvas-confetti`）＋ピンポン音（Web Audio API）。
   - 「もう１かい🔄」で特訓リストへ登録。
4. **特訓モード & シャッフル練習**
   - 「まちがえた問題だけ特訓」トグルで、苦手な問題だけを反復練習。
   - 「シャッフル」トグルで問題順の丸暗記を防止。
5. **PWA（Progressive Web App）対応**
   - Chromebookやタブレットのブラウザから「アプリとしてインストール」可能。
   - 全画面スタンドアロン動作、オフラインキャッシュ対応。

---

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript (Strictモード)
- **スタイリング**: Tailwind CSS, Lucide React
- **フォント**: Google Fonts「Zen Maru Gothic」
- **AI / Vision**: Google Generative AI SDK (`@google/generative-ai`) - Gemini 1.5 Flash
- **バリデーション**: Zod (厳格なスキーマ検証)
- **音声**: Web Audio API（シンセサイズ音・外部ファイル不要）
- **テスト**: Vitest
- **コンテナ / インフラ**: Docker (Alpine Multi-stage), Docker Compose

---

## 🚀 ローカル起動方法

### 1. リポジトリのクローンと依存関係インストール

```bash
git clone https://github.com/zyuuuukak1n/snap-drill.git
cd snap-drill
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、Gemini APIキーを設定します。

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 4. ユニットテストの実行

```bash
npm test
```

---

## 🐳 Dockerでのデプロイ

```bash
# ビルド & バックグラウンド起動
docker compose up -d --build

# ログ確認
docker compose logs -f
```

---

## 📄 ライセンス

[MIT License](LICENSE) © 2026 じゅーかきん

