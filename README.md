# AlmondLatte Blog

セキュリティ・CTF・開発についての技術ブログです。

https://almond-latte.com/

## Setup

```sh
npm install
npm run dev
```

Built with [Astro](https://astro.build/).

## HTB Writeup ワークフロー

Active マシンの Writeup は 2 段構成で管理する。

### Coming Soon プレースホルダー（main にコミット）

```
src/content/blog/htb-machine.mdx          ← ネタバレなしの公開用
src/content/blog/images/htb-machine.png   ← マシン画像
```

- `htbStatus: 'active'` を設定
- 本文はネタバレを含めず「Retired になり次第公開」等の案内のみ
- サイト上に「Coming Soon」バッジ付きで表示される
- Hero ポストには選ばれない・RSS にも含まれない

### 解法の執筆（_drafts / gitignored）

```
src/content/blog/_drafts/htb-machine.mdx
src/content/blog/_drafts/images/htb-machine*.png
```

- 実際の解法・スクリーンショットを書き進める
- `npm run dev` でプレビュー可能（ローカルのみ）
- ファイルは gitignored なのでコミットされない

### Retired 時の公開手順

1. `_drafts/htb-machine.mdx` の内容で `src/content/blog/htb-machine.mdx` を差し替え
2. `_drafts/images/` の画像を `src/content/blog/images/` にコピー
3. frontmatter の `htbStatus` を `'retired'` に変更
4. `npm run build && npm run preview` で確認
5. コミット＆プッシュ
