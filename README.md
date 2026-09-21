# ConSoul

![ConSoul のティーザー](docs/teaser.png)

## どんなゲーム？

ConSoul は、敵を避けながら迷路のアイテムを回収し、納品場所まで運ぶブラウザゲームです。3 人のキャラクターから 1 人を選び、ブロックを押して道を作ったり、ダッシュで敵を振り切ったりしながらステージを進めます。操作方法はゲーム画面の右側に表示されます。

## デモ

[ブラウザでプレイ（GitHub Pages）](https://shihu-14.github.io/ConSoul/)

公開するには、変更を `main` に反映した後、GitHub リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択します。`main` への push で `.github/workflows/deploy-pages.yml` が `dist/` をビルドして公開します。公開完了後、上のリンクから遊べます。

非公開リポジトリで Pages を使うには対応プランが必要です。また、リポジトリが非公開でも Pages のサイトは一般公開されます。

## ファイル構成

```text
src/
  main.ts            入力・更新・描画の接続
  game/              ステージ、プレイヤー、敵、ブロックのゲームロジック
  renderer/          Canvas による画面描画
  audio/             BGM と効果音
  assets/images/     ゲーム用の画像
  assets/audio/      ゲーム用の音声
docs/teaser.png      README 用のティーザー画像
index.html           ブラウザの入口
vite.config.ts       Vite の設定
.github/workflows/deploy-pages.yml  GitHub Pages への公開
```

## 実行方法

Node.js 20 系なら 20.19 以降、または 22.12 以降を使用してください。

```bash
npm ci
npm run dev
```
