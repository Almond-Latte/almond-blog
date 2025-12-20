---
title: "HTB Enumeration シリーズ - Initial Foothold への道"
description: "Hack The Box でのInitial Foothold取得に向けたEnumerationの手法をシリーズで解説します。"
tags: ["security", "ctf", "htb"]
pubDate: '2025-12-13'
---

> [!note]
> この記事は合法的なペネトレーションテスト環境（HTB, THM等）での使用を前提としています。許可のないシステムへの攻撃は違法です。

## はじめに

Hack The Boxでマシンを攻略する際、最も重要なフェーズはEnumeration（列挙）です。「Enumeration is key」とよく言われますが、Initial Footholdを取得できるかどうかは、このフェーズでどれだけ丁寧に情報を集められるかにかかっています。

このシリーズでは、Enumerationの各トピックを深掘りして解説していきます。

## シリーズ記事

### ポートスキャン・サービス特定

- [HTB攻略の第一歩 - nmapで確実にポートを見つける方法](/blog/htb-enumeration-nmap)

### Web Enumeration（予定）

- ディレクトリ探索（gobuster / ffuf / feroxbuster）
- サブドメイン・Vhost探索

### サービス別 Enumeration（予定）

- SMB Enumeration
- FTP / SSH Enumeration
- SNMP Enumeration

## Enumeration の基本フロー

私が普段行っているEnumerationの流れは以下の通りです。

1. **クイックポートスキャン** - まず開いているポートを把握
2. **詳細スキャン** - サービスとバージョンの特定
3. **サービスごとの調査** - 各サービスの深掘り
4. **脆弱性調査** - バージョン情報からExploitを検索
5. **Webアプリ調査** - HTTPがあれば詳細に調査

各ステップの詳細は、上記のシリーズ記事で解説しています。

## チェックリスト

Enumerationで見落としがないか確認するためのチェックリストです。

- [ ] 全ポートスキャン完了（TCP/UDP）
- [ ] サービスバージョン特定
- [ ] Webがあればディレクトリ探索
- [ ] ソースコード確認
- [ ] robots.txt / sitemap.xml 確認
- [ ] サブドメイン/Vhost探索
- [ ] デフォルトクレデンシャル試行
- [ ] バージョンからExploit検索（searchsploit, Exploit-DB）

## 効率化のコツ

- **ターミナルを分割**: tmuxやterminator で複数のスキャンを並行実行
- **メモを取る**: CherryTreeやObsidianで発見した情報を整理
- **コマンドをスクリプト化**: よく使うコマンドはシェルスクリプトにまとめる
- **結果は必ず保存する**: 後で見返せるようにファイルに出力

Happy Hacking!
