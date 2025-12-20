---
title: "Gobuster vs ffuf：どっちを使うべき？その違いと使い分けの結論"
description: "Go言語製の高速ディレクトリ探索ツールGobusterとffufを徹底比較。基本設計の違い、それぞれの強み、実践的な使い分けワークフローを解説します。"
tags: ["security", "ctf", "htb", "web", "gobuster", "ffuf"]
pubDate: '2025-12-18'
---

> [!note]
> この記事は合法的なペネトレーションテスト環境（HTB, THM等）での使用を前提としています。許可のないシステムへの攻撃は違法です

シリーズ: [HTB Enumeration シリーズ - Initial Foothold への道](/blog/htb-enumeration-tips)

## TL;DR

**結論：Gobusterとffufは競合ではなく補完関係。両方使うのが正解。**

| 用途 | おすすめ | 備考 |
|------|---------|------|
| ディレクトリ探索 | Gobuster | シンプルに始められる |
| DNSサブドメイン探索 | Gobuster | ffufはDNSクエリ不可 |
| vhost探索 | Gobuster | ベースライン自動判定 |
| パラメータFuzzing | ffuf | Gobusterは非対応 |
| 再帰スキャン | ffuf | Gobusterはネイティブ非対応 |
| False Positive除去 | ffuf | フィルタが強力 |

## はじめに

Webアプリケーションの診断で、 **ディレクトリ探索** は避けて通れません。隠されたエンドポイントや管理画面、バックアップファイルを見つけることが、Initial Foothold獲得の突破口になることはよくあります。

この分野でよく使われるのが **Gobuster** と **ffuf** 。どちらもGo言語製の高速ツールで、一見すると同じことができそうに見えます。「ffufの方が高機能らしいし、Gobusterは要らないのでは？」という声も聞きます。

でも、この2つは **設計思想が根本的に違います** 。そこを理解しないまま「どちらが優れているか」を議論しても意味がない。本記事では、両者の違いを整理した上で、実践的な使い分け方を解説します。

本記事は、HTBやTHMを回し始めて「なぜ結果が多すぎるのか」「どのツールを選ぶべきか」に悩み始めた方向けです。

## 基本設計の違い

ここが一番大事なところです。

### Gobuster：モード駆動型の「専用ツール」

Gobusterは **モード駆動型** の設計になっています。用途ごとに専用モードがあり、それぞれに最適化されたオプションが用意されています。

```bash showLineNumbers
# ディレクトリ探索モード
gobuster dir -u http://target.com -w /path/to/wordlist.txt

# DNSサブドメイン探索モード
gobuster dns -d target.com -w /path/to/subdomains.txt

# 仮想ホスト探索モード
gobuster vhost -u http://target.com -w /path/to/vhosts.txt
```

この設計の利点は **「何をしたいか」を明示的に指定できること** です。`gobuster dir`と打てば「ディレクトリ探索をするんだな」と一目瞭然で、オプションも必要最小限で済みます。

### ffuf：キーワード置換型の「汎用Fuzzer」

一方、ffufは **キーワード置換型** の設計です。HTTPリクエストのどこにでも`FUZZ`というキーワードを埋め込んで、それをワードリストの値で置き換えていくアプローチ。

```bash showLineNumbers
# ディレクトリ探索
ffuf -u http://target.com/FUZZ -w /path/to/wordlist.txt

# サブドメイン探索（Hostヘッダーをfuzz）
ffuf -u http://target.com -H "Host: FUZZ.target.com" -w /path/to/subdomains.txt

# POSTパラメータのfuzzing
ffuf -u http://target.com/api -X POST -d '{"user":"FUZZ"}' -w /path/to/usernames.txt
```

この設計の強みは **柔軟性** です。URL、ヘッダー、POSTボディ、Cookieなど、HTTPリクエストのどこでもfuzzingできます。

### 比較表

| 項目 | Gobuster | ffuf |
|------|----------|------|
| **設計思想** | モード駆動型 | キーワード置換型 |
| **学習コスト** | 低い | やや高い |
| **ディレクトリ探索** | ◎ シンプル | ○ 可能 |
| **DNS探索** | ◎ DNSクエリ直接 | △ HTTPベースのみ |
| **vhost探索** | ◎ ベースライン自動判定 | ○ 手動フィルタで調整 |
| **フィルタリング** | 基本的 | 非常に強力 |
| **再帰スキャン** | × 非対応 | ◎ 対応 |
| **POST/JSONのfuzzing** | × 非対応 | ◎ 得意 |
| **複数箇所の同時fuzzing** | × 非対応 | ◎ 対応 |

## Gobusterの強みと「捨てられない理由」

### 1. 思考停止で打てるシンプルさ

Reconの初期段階では、とにかく **素早く広範囲を探索したい** ものです。余計なことを考えずにサッと打てる、というのは地味に大きい。

```bash
# これだけで始められる
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt
```

ffufで同じことをするには、`FUZZ`キーワードの位置を意識する必要があります。小さな差に見えますが、何十台ものマシンを相手にするときには、この「考えなくていい」というのが効いてきます。

### 2. DNSモードの存在

**これがGobusterを捨てられない最大の理由です。**

ffufはHTTPプロトコルに特化したツールですが、Gobusterは **DNSプロトコルを直接扱えます** 。

```bash
# DNSサブドメイン探索（DNSクエリを直接発行）
gobuster dns -d target.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

このコマンドは、DNSサーバーに対して直接クエリを送信します。Webサーバーが存在しないサブドメインや、内部DNS専用のサブドメインも発見できる可能性があります。

ffufでサブドメイン探索をする場合、HTTPリクエストのHostヘッダーを変えてWebサーバーの応答を見る方式になります。

```bash
# ffufでのサブドメイン探索（HTTPベース）
ffuf -u http://target.com -H "Host: FUZZ.target.com" -w /path/to/subdomains.txt
```

これはVirtual Host探索としては有効ですが、 **Webサーバーが存在しないサブドメインは発見できません** 。DNSレベルの探索が必要な場面では、Gobusterは有力な選択肢の一つとなります。

### 3. vhostモードの自動フィルタリング

Virtual Host探索でも、Gobusterには隠れたメリットがあります。

`gobuster vhost`モードは、デフォルトで **存在しないサブドメインの応答を自動で学習** し、それと異なるものだけを表示してくれます。

```bash
# Gobuster: 自動フィルタリングで結果がクリーン
gobuster vhost -u http://target.com -w vhosts.txt
```

一方、ffufでvhost探索をする場合、手動で`-fs`でサイズフィルタを設定しないと、全リクエストの結果が画面を埋め尽くします。

```bash
# ffuf: フィルタを自分で探る必要がある
# まず一度実行してデフォルトのレスポンスサイズを確認
ffuf -u http://target.com -H "Host: FUZZ.target.com" -w vhosts.txt
# → 大量の結果が表示される...

# サイズを確認してフィルタを設定
ffuf -u http://target.com -H "Host: FUZZ.target.com" -w vhosts.txt -fs 1234
```

この「ひと手間」の差は、大量のターゲットを相手にするときに効いてきます。

### 4. 初心者への優しさ

`gobuster dir`、`gobuster dns`、`gobuster vhost`というモード分けは、初心者にとって分かりやすい構造です。「今自分が何をしているのか」が明確なので、学習の指針にもなります。

## ffufの真価と「選ばれる理由」

### 1. 強力なフィルタリング機能

**ffuf最大の強みは「False Positiveを制御できること」です。**

実際のWebアプリケーション診断では、 **False Positiveとの戦い** が常に付きまといます。404以外のステータスコードで「ページが存在しない」ことを示すサイト、すべてのリクエストに200を返すWAFなど、単純なステータスコードだけでは判断できないケースが多いです。

ffufはここに強い。

```bash showLineNumbers
# ステータスコードでフィルタ（403と404を除外）
ffuf -u http://target.com/FUZZ -w wordlist.txt -fc 403,404

# レスポンスサイズでフィルタ（4242バイトの応答を除外）
ffuf -u http://target.com/FUZZ -w wordlist.txt -fs 4242

# 単語数でフィルタ（12単語の応答を除外）
ffuf -u http://target.com/FUZZ -w wordlist.txt -fw 12

# 行数でフィルタ
ffuf -u http://target.com/FUZZ -w wordlist.txt -fl 8

# 正規表現でフィルタ（特定の文字列を含む応答を除外）
ffuf -u http://target.com/FUZZ -w wordlist.txt -fr "not found"
```

特に便利なのが`-fs`のサイズフィルタ。多くのWebアプリケーションは、存在しないページに対して同じサイズのエラーページを返します。最初に1回スキャンを走らせて「典型的なエラーレスポンスのサイズ」を特定し、それをフィルタすれば、ノイズを消して **本当に見たい結果だけ** を残せます。

```bash showLineNumbers
# ワークフロー例：まず調査してからフィルタを設定
# 1. 最初の数件でレスポンスサイズを確認
ffuf -u http://target.com/FUZZ -w wordlist.txt | head -20

# 2. 一般的なエラーサイズ（例：1234バイト）を除外して本番スキャン
ffuf -u http://target.com/FUZZ -w wordlist.txt -fs 1234
```

### 2. HTTPリクエストのあらゆる場所をFuzzingできる柔軟性

ffufの真価は、ディレクトリ探索よりも **パラメータFuzzing** にあります。

```bash showLineNumbers
# GETパラメータのfuzzing
ffuf -u "http://target.com/api?id=FUZZ" -w /path/to/ids.txt

# POSTボディのfuzzing
ffuf -u http://target.com/login -X POST \
  -d "username=admin&password=FUZZ" \
  -w /path/to/passwords.txt

# JSONボディのfuzzing
ffuf -u http://target.com/api/v1/users -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","role":"FUZZ"}' \
  -w /path/to/roles.txt

# 複数箇所の同時fuzzing（クラスターボム）
ffuf -u "http://target.com/FUZZ1/FUZZ2" \
  -w /path/to/dirs.txt:FUZZ1 \
  -w /path/to/files.txt:FUZZ2
```

API診断では、エンドポイント、パラメータ名、パラメータ値をすべてfuzzingしたくなります。こういう用途だとffuf一択ですね。

### 3. 再帰スキャン

ディレクトリの中にさらにディレクトリがある場合、再帰的に探索したくなります。ffufは`-recursion`フラグでこれに対応しています。

```bash
# 再帰スキャン
ffuf -u http://target.com/FUZZ -w wordlist.txt -recursion -recursion-depth 2
```

Gobusterはネイティブで再帰スキャンをサポートしていません。xargsやラッパースクリプトで対応は可能ですが、運用体験はffufが優位です。

### 4. マッチャーとフィルターの組み合わせ

ffufには「除外するフィルター」だけでなく「残すマッチャー」もあります。

```bash
# 200と301のみをマッチ
ffuf -u http://target.com/FUZZ -w wordlist.txt -mc 200,301

# サイズが1000バイト以上のレスポンスのみをマッチ
ffuf -u http://target.com/FUZZ -w wordlist.txt -ms ">1000"
```

マッチャーとフィルターを組み合わせれば、かなり細かい条件で結果を絞り込めます。

### 5. 出力形式の豊富さ

```bash showLineNumbers
# JSON出力（後処理に便利）
ffuf -u http://target.com/FUZZ -w wordlist.txt -o results.json -of json

# CSV出力
ffuf -u http://target.com/FUZZ -w wordlist.txt -o results.csv -of csv

# HTML出力（レポート作成に便利）
ffuf -u http://target.com/FUZZ -w wordlist.txt -o results.html -of html
```

## 結論

### 「ffufがあればGobusterはいらない」は間違い

冒頭で述べた疑問に対する答えは **No** です。両者は設計思想が異なり、得意分野が異なります。

- **Gobuster**はDNSモードを持っていて、シンプルなコマンド体系で素早くReconを回せます
- **ffuf**はフィルタリングの柔軟性が高く、複雑な診断シナリオに対応できます

### 比喩で言えば

- **Gobuster** は「万能ナイフ」。パッと取り出してサッと使える
- **ffuf** は「精密ドライバーセット」。細かい作業に強いが、準備が要る

どちらか一方に絞る必要はなく、 **両方を適材適所で使い分ける** のがベストです。

### 実践的ワークフロー

以下は、筆者が実際に使っているワークフローです。

```bash showLineNumbers
# 1. まずGobusterで広範囲を浅く探索
gobuster dns -d target.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -o dns_results.txt
gobuster dir -u http://target.com -w /usr/share/seclists/Discovery/Web-Content/common.txt -o dir_results.txt

# 2. 見つかったサブドメインやディレクトリで怪しいものをffufで深掘り
ffuf -u http://api.target.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -fc 404 -fs 0

# 3. パラメータFuzzingが必要な箇所はffufで
ffuf -u "http://api.target.com/users?FUZZ=1" -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -fs 42
```

Happy Hacking!
