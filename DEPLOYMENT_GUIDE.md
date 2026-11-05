# スナップドリル (SnapDrill) デプロイガイド (汎用版)

本ドキュメントは、Docker Compose または VPS 環境で「スナップドリル (SnapDrill)」を本番運用するための一般的なセットアップガイドです。

---

## 📋 前提条件

- Docker 24.0+ および Docker Compose v2+ がインストールされていること
- Google Gemini API キー（Google AI Studioで取得）
- 公開用のドメイン（SSL証明書対応）

---

## 🚀 デプロイ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/zyuuuukak1n/snap-drill.git
cd snap-drill
```

### 2. 環境変数の設定
`.env.example` をコピーして `.env` を作成します。
```bash
cp .env.example .env
```

`.env` 内の `GEMINI_API_KEY` および公開URLを設定します。
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 3. Docker Compose でビルド & 起動
```bash
docker compose up -d --build
```

コンテナのログ確認:
```bash
docker compose logs -f
```

コンテナは `127.0.0.1:3087` にバインドされます。

---

## 🌐 Nginx リバースプロキシ設定例（SSL対応）

ドメインへのアクセスをローカルの Docker コンテナ（ポート 3087）へ転送します。

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3087;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📱 PWA（Progressive Web App）としての利用

- **Chromebook / PC (Chrome)**: アドレスバー右端の「インストール」アイコンをクリックすると、独立したデスクトップアプリとして利用可能。
- **iPad / タブレット (Safari / Chrome)**: 「ホーム画面に追加」を行うことで、全画面モードでスタイラスペン学習が可能になります。
