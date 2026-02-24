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

Active マシンの Writeup は `src/content/blog/_drafts/` に置く。このディレクトリは `.gitignore` で除外されているため、解法がリポジトリに入ることはない。

### 執筆中（Active）

```
src/content/blog/_drafts/htb-machine.mdx
src/content/blog/_drafts/images/htb-machine.png
```

- `npm run dev` で実コンテンツをプレビューできる
- ファイルは gitignored なのでコミットされない

### Retired 時の公開手順

1. `_drafts/` から `src/content/blog/` 直下にファイル・画像を移動
2. frontmatter の `htbStatus` を `'retired'` に変更
3. `npm run build && npm run preview` で確認
4. コミット＆プッシュ
