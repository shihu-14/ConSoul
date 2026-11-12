# Renderer and Audio Refactor Design

## Intent

ゲーム仕様・見た目・操作感を維持しながら，描画と音声の責務を明確にし，`main.ts`から個別実装と表示都合の処理を取り除く．

## Goals

- `renderer/index.ts`を唯一の外部公開窓口とし，Player，Enemy，墓石，Stage，HUD，Effect，画面を責務別に整理する．
- Rendererは`GameState`を読み取って描画し，ゲーム状態を変更しない．
- 墓石の画像パターンをアプリ起動時に決定し，移動・リトライ後も同じ値をStateから参照する．
- ダッシュとPushの効果音通知を`GameSignal`へ移し，`main.ts`でSignalを組み立てない．
- BGM操作はモードが実際に変わったときだけ行う．
- 描画上必要な補正値は意味のある定数へまとめ，不要なMap・配列生成・公開関数を削除する．

## Non-goals

- ゲームルール，速度，衝突，入力割り当て，アセットの見た目・音を変更しない．
- RendererやAudioをクラス化しない．
- E2Eテストや描画スナップショットテストを追加しない．
- 画像・音声アセットの再生成は，既存の見た目や音を変えるリスクが高いため今回は行わない．

## Selected approach

旧ファイルを残さない一括移行を採用する．Rendererは`player.ts`，`enemy.ts`，`block.ts`，`stage.ts`，`hud.ts`，`effects.ts`，`tutorial.ts`，`screens.ts`，`game.ts`へ整理し，`index.ts`から画面描画APIだけを公開する．Audioは既存の単一Managerを保ちつつファイル名と公開APIを整理し，過度な分割を避ける．

段階移行の再exportは入口を増やすため採用しない．描画状態をRenderer内のMapで引き継ぐ方法も，リトライ処理をUIへ漏らすため採用しない．

## State and event changes

- `BlockState`に壁・苔のスプライト番号を追加する．Stageモジュール読込時に全Stage分を一度だけ生成し，`createStage`は対応する値をコピーする．
- `performGameAction`はPlayer Action結果をダッシュ・Pushの`GameSignal[]`へ変換する．無効操作は空配列を返す．
- Audio公開APIはSignal再生，効果音停止，モード変更通知に限定する．
- `main.ts`は操作結果のSignal通知，ゲーム更新Signal通知，モード差分のAudio通知，描画を順に調停する．

## Validation

- `npm test`
- `npm run typecheck`
- `npm run lint`
- E2E，長時間実行，追加の大規模テスト，ビルドは行わない．
