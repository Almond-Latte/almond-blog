---
title: "nmap 完全ガイド - ポートスキャンの基礎から応用まで"
description: "HTBでのEnumerationに欠かせないnmapの使い方を、基礎から応用まで詳しく解説します。"
pubDate: '2025-12-13'
---

> [!note]
> この記事は合法的なペネトレーションテスト環境（HTB, THM等）での使用を前提としています。許可のないシステムへの攻撃は違法です。

シリーズ: [HTB Enumeration シリーズ - Initial Foothold への道](/blog/htb-enumeration-tips)

## はじめに

nmap（Network Mapper）は、ネットワーク探索とセキュリティ監査のためのオープンソースツールです。HTBやTHMでマシンを攻略する際、最初に実行するツールといっても過言ではありません。

この記事では、nmapの基本的な使い方から、実践的なテクニックまでを詳しく解説します。

## nmapの基本

### 基本的な使い方

最もシンプルな使い方は、ターゲットを指定するだけです：

```bash
nmap <target>
```

これだけで、よく使われる1000ポートをスキャンしてくれます。

## スキャンタイプ

nmapには様々なスキャンタイプがあります。状況に応じて使い分けましょう。

### TCP SYNスキャン (-sS)

```bash
nmap -sS <target>
```

- **別名**: ステルススキャン、ハーフオープンスキャン
- **仕組み**: SYNパケットを送信し、SYN/ACKが返ればポートオープン、RSTが返ればクローズと判断
- **特徴**: 完全なTCP接続を確立しないため、ログに残りにくい
- **root権限**: 必要

### TCP Connectスキャン (-sT)

```bash
nmap -sT <target>
```

- **仕組み**: 通常のTCP 3ウェイハンドシェイクを完了させる
- **特徴**: root権限不要だが、ログに残りやすい
- **使用場面**: root権限がない場合、またはプロキシ経由でスキャンする場合

### UDPスキャン (-sU)

```bash
nmap -sU <target>
```

- **仕組み**: UDPパケットを送信し、ICMPポート到達不能が返ればクローズと判断
- **特徴**: 非常に時間がかかる（UDPは応答がないことが多い）
- **ポイント**: `--top-ports 100` などで対象を絞ると効率的

```bash
# よく使うUDPスキャン
nmap -sU --top-ports 100 <target>
```

### その他のスキャンタイプ

| オプション | 名称 | 用途 |
|-----------|------|------|
| `-sA` | ACKスキャン | ファイアウォールのルール確認 |
| `-sW` | Windowスキャン | ACKスキャンの拡張 |
| `-sN` | NULLスキャン | フラグなしパケット |
| `-sF` | FINスキャン | FINフラグのみ |
| `-sX` | Xmasスキャン | FIN, PSH, URGフラグ |

> [!note]
> NULL, FIN, Xmasスキャンは、ファイアウォール回避に使えることがありますが、Windowsでは正しく動作しません。

## ポート指定オプション

### 基本的なポート指定

```bash showLineNumbers
# 単一ポート
nmap -p 80 <target>

# 複数ポート
nmap -p 22,80,443 <target>

# ポート範囲
nmap -p 1-1000 <target>

# 全ポート（65535）
nmap -p- <target>

# よく使われるポート上位N個
nmap --top-ports 100 <target>
```

### おすすめの使い方

HTBでは、まず全ポートスキャンを行い、その後詳細スキャンを行うのが定番です：

```bash showLineNumbers
# ステップ1: 全ポートクイックスキャン
nmap -p- --min-rate=1000 -T4 <target> -oN allports.txt

# ステップ2: 見つかったポートの詳細スキャン
nmap -p 22,80,443,8080 -sC -sV <target> -oN detailed.txt
```

## サービス・バージョン検出

### バージョン検出 (-sV)

```bash
nmap -sV <target>
```

各ポートで動作しているサービスとバージョンを特定します。Exploit検索に必要な情報を取得できます。

### バージョン検出の強度

```bash showLineNumbers
# 軽い検出（デフォルト）
nmap -sV <target>

# より詳細な検出
nmap -sV --version-intensity 5 <target>

# 全プローブを試す
nmap -sV --version-all <target>
```

### OS検出 (-O)

```bash
nmap -O <target>
```

ターゲットのOSを推測します。TTLやTCPウィンドウサイズなどの特徴から判断します。

## タイミングオプション

### タイミングテンプレート (-T)

```bash
nmap -T4 <target>
```

| テンプレート | 名称 | 特徴 |
|-------------|------|------|
| `-T0` | Paranoid | 非常に遅い、IDS回避用 |
| `-T1` | Sneaky | 遅い、IDS回避用 |
| `-T2` | Polite | 控えめ、帯域を抑える |
| `-T3` | Normal | デフォルト |
| `-T4` | Aggressive | 高速、信頼できるネットワーク向け |
| `-T5` | Insane | 最速、パケットロスの可能性あり |

HTBでは`-T4`が一般的に使われます。

### 詳細なタイミング設定

```bash showLineNumbers
# 最小送信レート
nmap --min-rate=1000 <target>

# 最大送信レート
nmap --max-rate=100 <target>

# パラレル実行数
nmap --min-parallelism=10 <target>
```

## NSE（Nmap Scripting Engine）

nmapの真の力はNSEスクリプトにあります。

### デフォルトスクリプト (-sC)

```bash
nmap -sC <target>
```

`-sC`は`--script=default`と同等で、安全なデフォルトスクリプトを実行します。

### スクリプトカテゴリ

```bash showLineNumbers
# 脆弱性スキャン
nmap --script=vuln <target>

# 認証関連
nmap --script=auth <target>

# ブルートフォース
nmap --script=brute <target>

# 発見系
nmap --script=discovery <target>
```

### 便利なスクリプト例

```bash showLineNumbers
# SMB脆弱性チェック
nmap --script=smb-vuln* -p 445 <target>

# HTTP関連情報収集
nmap --script=http-enum,http-headers,http-methods -p 80 <target>

# FTP匿名ログイン確認
nmap --script=ftp-anon -p 21 <target>

# SSH認証方式確認
nmap --script=ssh-auth-methods -p 22 <target>

# デフォルトクレデンシャル確認
nmap --script=*-brute -p 21,22,80 <target>
```

### スクリプトの検索

```bash
# インストール済みスクリプト一覧
ls /usr/share/nmap/scripts/

# スクリプト検索
ls /usr/share/nmap/scripts/ | grep http
```

## 出力オプション

### 出力形式

```bash showLineNumbers
# 通常出力
nmap -oN output.txt <target>

# XML形式
nmap -oX output.xml <target>

# Grepable形式
nmap -oG output.gnmap <target>

# 全形式を一度に出力
nmap -oA output <target>
```

### おすすめの出力設定

```bash
# 常にファイル出力する習慣を！
nmap -sC -sV -oA nmap/initial <target>
```

ディレクトリ`nmap/`を作っておき、そこに出力すると整理しやすいです。

## 実践的なワークフロー

### HTBでの定番フロー

```bash showLineNumbers
# 1. ディレクトリ作成
mkdir nmap

# 2. クイック全ポートスキャン
nmap -p- --min-rate=1000 -T4 <target> -oN nmap/allports.txt

# 3. 結果から開いているポートを抽出
cat nmap/allports.txt | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//

# 4. 詳細スキャン（上記で見つかったポートを指定）
nmap -p 22,80,443 -sC -sV -oA nmap/detailed <target>

# 5. UDPも忘れずに
nmap -sU --top-ports 20 -oN nmap/udp.txt <target>
```

### ワンライナー（全ポート→詳細）

```bash
ports=$(nmap -p- --min-rate=1000 -T4 <target> | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
nmap -p$ports -sC -sV -oA nmap/targeted <target>
```

## よくある落とし穴と対処法

### 1. UDPを忘れる

TCPだけでなく、UDPも確認しましょう。SNMP(161)やDNS(53)など、重要なサービスがUDPで動いていることがあります。

### 2. 高番号ポートを見逃す

デフォルトでは上位1000ポートしかスキャンしません。`-p-`で全ポートスキャンを忘れずに。

### 3. スキャン速度が遅い

`-T4`と`--min-rate=1000`を組み合わせると、信頼できるネットワーク（HTBなど）では効率的にスキャンできます。

### 4. 結果を保存しない

毎回スキャンし直すのは時間の無駄です。`-oA`で常に保存する習慣をつけましょう。

## 便利なエイリアス

`.bashrc`や`.zshrc`に追加しておくと便利です：

```bash showLineNumbers
# クイック全ポートスキャン
alias nmapquick='nmap -p- --min-rate=1000 -T4'

# 詳細スキャン
alias nmapdetail='nmap -sC -sV -oA nmap/detailed'

# フルスキャン（全ポート + 詳細）
nmapfull() {
    mkdir -p nmap
    ports=$(nmap -p- --min-rate=1000 -T4 $1 | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
    nmap -p$ports -sC -sV -oA nmap/full $1
}
```

## まとめ

nmapはEnumerationの基礎であり、使いこなせるようになると効率が大幅に上がります。

ポイントをまとめると：

- **全ポートスキャンを忘れない** (`-p-`)
- **UDPもチェック** (`-sU`)
- **バージョン検出を行う** (`-sV`)
- **NSEスクリプトを活用** (`-sC`, `--script`)
- **結果は必ず保存** (`-oA`)

次回は、発見したWebサービスに対するディレクトリ探索について解説します。

Happy Hacking!
