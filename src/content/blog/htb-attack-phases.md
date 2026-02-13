---
title: "HTB/Boot2Root 攻略の全体像 - 6つの攻撃フェーズと各フェーズの勘所"
description: "HTBやBoot2Rootマシン攻略における6つの攻撃フェーズ（Enumeration → Initial Foothold → Post-Exploitation → Lateral Movement → Privilege Escalation → Proof）の目的・キーポイント・代表的ツールを体系的に解説します。"
tags: ["security", "ctf", "htb", "pentest"]
pubDate: '2026-02-13'
---

> [!caution]
> この記事は合法的なペネトレーションテスト環境（HTB, THM, VulnHub等）での使用を前提としています。許可のないシステムへの攻撃は違法です。

シリーズ: [HTB Enumeration シリーズ - Initial Foothold への道](/blog/htb-enumeration-tips)

## TL;DR

HTB/Boot2Rootマシンの攻略は、大きく **6つのフェーズ** に分かれます。

| フェーズ | 目的 | 代表的ツール |
|---------|------|-------------|
| 1. Enumeration | Attack Surfaceの特定 | nmap, gobuster, ffuf, enum4linux |
| 2. Initial Foothold | シェル取得 | searchsploit, Burp Suite, netcat |
| 3. Post-Exploitation | 内部情報の収集 | LinPEAS, WinPEAS |
| 4. Lateral Movement | 他のホスト・ユーザーへの横展開 | chisel, ligolo, Evil-WinRM |
| 5. Privilege Escalation | root/SYSTEM権限の奪取 | GTFOBins, LOLBAS, BloodHound |
| 6. Proof | フラグ回収 | - |

各フェーズは独立したものではなく、**行き来しながら進めるもの**です。Initial Footholdが取れなければEnumerationに戻り、Privilege Escalationのヒントが見つからなければPost-Exploitationで追加調査します。この「戻る判断」ができるかどうかが、攻略の速度を左右します。

## 全体のワークフロー図

![HTB/Boot2Root 攻略フロー](/images/htb-attack-phases/htb-flow.png)

## はじめに

HTBやVulnHubのマシンに挑戦し始めたとき、「何から手を付ければいいのか」「今自分はどのフェーズにいるのか」がわからなくなることはないでしょうか。

WriteUpを読むと一直線に攻略しているように見えますが、実際には **何度もフェーズを行き来しながら** 進めています。全体像を把握しておくと、「次に何をすべきか」の判断が格段に早くなります。

### 既存のフレームワークとの関係

攻撃フェーズを体系化したフレームワークは、業界にすでにいくつか存在します。

- **[Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html)**（Lockheed Martin） — ReconからC2、目的実行までの7段階です。元々は国家レベルの脅威分析向けで、防御側がどこで攻撃を断ち切るかを考えるためのモデルです
- **[PTES](http://www.pentest-standard.org/index.php/Main_Page)**（Penetration Testing Execution Standard） — 実務のペネトレーションテスト手順を標準化したフレームワークです。事前調査、脅威モデリング、報告書作成まで含む包括的な規格です
- **[MITRE ATT&CK](https://attack.mitre.org/)** — 実際の攻撃で観測されたTTP（Tactics, Techniques, Procedures）のナレッジベースです。「どの手法が現実に使われているか」を網羅的に分類しています

業務でペネトレーションテストを行う場合、これらのフレームワークに沿った手順と報告が求められることが多いです。

本記事では、これらを踏まえつつも **HTB/Boot2Root攻略に特化した6つのフェーズ** として簡略化して整理します。実務のフレームワークほど厳密ではありませんが、「マシンを1台攻略する」という目的に対しては、このくらいの粒度が実用的です。

> [!note]
> 本記事ではLateral Movement（横展開）をPrivilege Escalation（権限昇格）の **前** に置いていますが、MITRE ATT&CKなどでは逆の順序です。これはスコープの違いによるものです。実際のネットワーク侵害では、他のホストへ横展開するためにSYSTEM権限でのクレデンシャルダンプやセッションハイジャックが必要になることが多く、「まず権限昇格してから横に動く」のが自然な流れになります。一方、HTBのStandalone Machineでは「一般ユーザーA → 一般ユーザーB（横移動）→ root」というパターンが典型的で、root権限を取るのは最後のゴールです。本記事ではHTBの実践に合わせた順序を採用しています。

## フェーズ1: Enumeration（情報収集）

### このフェーズで何をするのか

ターゲットマシンの **Attack Surfaceを特定** するフェーズです。開いているポート、動いているサービス、そのバージョン、Webアプリケーションの構造など、攻略に必要なあらゆる情報を集めます。

### なぜ最も重要なのか

「Enumeration is key」とよく言われますが、これは単なる格言ではなく事実です。**Initial Footholdが取れない原因の大半は、Enumerationの不足です。** 攻撃手法が思いつかないのではなく、情報を取りこぼしているのです。見落としたポート、確認しなかったサブドメイン、読み飛ばしたHTMLコメントに答えが隠れていることが非常に多いです。

### キーポイント

- **広く、そして深く。** まず全ポートスキャン（TCP/UDP）でAttack Surfaceの全体像を掴み、次にサービスごとに深掘りします。いきなり深掘りに入ると視野が狭くなります
- **「何もない」は情報。** 探索して何も見つからなかったこと自体が、次のアクションを決めるヒントになります。記録に残して次に進みましょう
- **結果はすべて保存する。** 後のフェーズで「あのとき見つけた文字列」が急に意味を持つことがあります。再スキャンは時間の無駄です
- **メモを取り続ける。** 発見した情報をCherryTreeやObsidianで整理する習慣が、マシン攻略の効率を大きく変えます

### 代表的なツール

| カテゴリ | ツール | ひとこと |
|---------|--------|---------|
| ポートスキャン | nmap | すべてはここから。 `-sC -sV` で詳細スキャン |
| ポートスキャン | masscan | 全ポートを高速に。発見後はnmapで再スキャン |
| Web探索 | gobuster | ディレクトリ・DNS・vhost探索。シンプルに始められる |
| Web探索 | ffuf | 汎用Fuzzer。フィルタが強力で柔軟性が高い |
| Web探索 | nikto | 既知の脆弱性やデフォルト設定のクイックチェック |
| Web探索 | whatweb | CMS・フレームワーク・サーバー情報を一発で特定 |
| Webアプリ診断 | Burp Suite | 通信の傍受・改ざん。Community版で十分使える |
| SMB | enum4linux, smbclient | ユーザー列挙、共有フォルダのリスト・接続 |
| DNS | dig, dnsrecon | ゾーン転送、サブドメイン探索 |
| SNMP | snmpwalk, onesixtyone | Community Stringの特定と情報リーク |
| LDAP | ldapsearch | AD環境でのユーザー・グループ列挙 |

> 各ツールの詳細なコマンドは、[nmap記事](/blog/htb-enumeration-nmap)や[Gobuster vs ffuf記事](/blog/gobuster-vs-ffuf)で解説しています。

## フェーズ2: Initial Foothold（初期アクセス）

### このフェーズで何をするのか

Enumerationで集めた情報をもとに、ターゲットマシンへの **最初のシェルを取得** するフェーズです。脆弱性を突いたExploitの実行、認証の突破、Webアプリケーション経由のコード実行など、方法は多岐にわたります。

### キーポイント

- **バージョン情報はExploitへの最短ルート。** Enumerationで特定したサービスバージョンをsearchsploitやExploit-DBで検索するのが最初の一手です。CVE番号が見つかればPoCがGitHubに転がっていることも多いです
- **「シェルが取れる」と「コード実行ができる」は別。** RCE（Remote Code Execution）の脆弱性を見つけても、そこからインタラクティブなシェルに繋げるのは別のスキルです。リバースシェルのペイロードは[revshells.com](https://www.revshells.com/)で言語・シェル種別に応じて生成できます
- **取得したシェルは必ずアップグレードする。** 素のリバースシェルはタブ補完もCtrl+Cも効きません。`python3 -c 'import pty;pty.spawn("/bin/bash")'` → Ctrl+Z → `stty raw -echo; fg` → `export TERM=xterm` の手順でフルTTYにしましょう。これを怠ると後のフェーズで苦労します

> [!important]
> シェルのアップグレードは「後でやればいい」ではなく、**シェルを取得したら最初にやること**です。不完全なシェルのままPost-Exploitationに進むと、コマンドの実行ミスや出力の取りこぼしが発生します。
- **「刺さらない」なら戻る。** Exploitが動かないときに無理にデバッグし続けるより、Enumerationに戻って別のAttack Surfaceを探す方が早いことが多いです

### よくあるInitial Footholdパターン

| パターン | 例 |
|---------|-----|
| 既知のCVE | 古いバージョンのサービスに対する公開Exploit |
| デフォルトクレデンシャル | admin:admin, admin:password など |
| SQLインジェクション | ログインフォーム、検索機能 |
| ファイルインクルージョン | LFI/RFIでコード実行やファイル読み取り |
| ファイルアップロード | Webシェルのアップロード |
| コマンドインジェクション | 入力値がOSコマンドに渡される |
| SSTI | テンプレートエンジンのインジェクション |

### 代表的なツール

| ツール | ひとこと |
|--------|---------|
| searchsploit | Exploit-DBのローカルコピー。まずここで検索 |
| Burp Suite | リクエストの改ざん・再送でWebアプリの脆弱性を突く |
| netcat (nc) | リバースシェルのリスナー |
| revshells.com | 各言語のリバースシェルペイロード生成 |

## フェーズ3: Post-Exploitation（侵入後の情報収集）

### このフェーズで何をするのか

シェルを取得した後、**マシン内部の情報を収集する**フェーズです。Privilege Escalationに繋がるヒントを探すのが主な目的ですが、他のユーザーのクレデンシャルや、内部ネットワークの情報が見つかることもあります。

### キーポイント

- **自動ツールと手動チェックの両方が必要。** LinPEAS/WinPEASは網羅的ですが、出力が膨大で本当に重要な情報を見落とすこともあります。`sudo -l`、`id`、`ss -tlnp` のような基本コマンドを手動で叩く習慣を持つと、自動ツールの結果を読む力もつきます
- **「誰として」「何ができるか」を最初に確認。** `id` / `whoami /all` で自分の権限とグループを確認するのが最優先です。所属グループによっては、それだけで権限昇格のパスが見つかります
- **ネットワーク情報は金脈。** `ss -tlnp` や `netstat -ano` で内部でのみリッスンしているサービスが見つかれば、Lateral Movementの足がかりになります。`/etc/hosts` や `arp -a` も忘れずに確認しましょう
- **ファイル転送の手段を確保する。** ツールやExploitをターゲットに送り込む必要があります。攻撃者マシンで `python3 -m http.server` を立てて、ターゲットから `curl` / `wget` / `certutil` で取得するのが基本パターンです

### 何を探すのか（Linux）

| 確認項目 | なぜ重要か |
|---------|-----------|
| `sudo -l` | パスワードなしで実行できるコマンド → GTFOBinsで即PrivEsc |
| SUID/SGIDバイナリ | root権限で実行されるバイナリの悪用 |
| Cronジョブ | rootが実行するスクリプトへの書き込み |
| 書き込み可能ファイル | 設定ファイルやスクリプトの改ざん |
| パスワード・鍵ファイル | 設定ファイル内のハードコードされたクレデンシャル |
| カーネルバージョン | 既知のカーネルExploitの適用可否 |
| 内部リッスンポート | 外部からは見えないサービスの発見 |

### 何を探すのか（Windows）

| 確認項目 | なぜ重要か |
|---------|-----------|
| `whoami /priv` | SeImpersonatePrivilege等の危険な権限 |
| `systeminfo` | パッチ適用状況・OS情報 |
| 保存されたクレデンシャル | `cmdkey /list` で確認 |
| サービス設定 | 権限の弱いサービスの悪用 |
| スケジュールタスク | 高権限で実行されるタスクの改ざん |
| 内部リッスンポート | 外部からは見えないサービスの発見 |

### 代表的なツール

| ツール | ひとこと |
|--------|---------|
| LinPEAS / WinPEAS | 権限昇格パスの自動探索。色付き出力で重要度がわかる |
| linEnum | LinPEASより軽量な代替。環境制約がある場合に |

## フェーズ4: Lateral Movement（横展開）

### このフェーズで何をするのか

攻略済みのホストを足がかりに、**ネットワーク内の別のホストやユーザーへアクセスを広げる**フェーズです。HTBのStandalone Machineでは明確に発生しないこともありますが、**Pro Labs**やAD環境のマシン、Boot2Rootシナリオでは頻出します。

Standalone Machineでも、あるユーザーから別のユーザーに「横に移動」するケースは珍しくありません。user.txtを取得した後、別のユーザーのクレデンシャルを見つけて乗り換え、そこからrootへの権限昇格パスを探すのが典型的なHTBの攻略パターンです。

### キーポイント

- **Post-Exploitationで見つけた情報が鍵。** 設定ファイル内のパスワード、SSHキー、データベース内のハッシュ、ブラウザの保存パスワードなど、これらを使って別のユーザーやホストにアクセスします
- **内部でのみリッスンしているサービスに注目。** `ss -tlnp` で見つけた内部サービスに、トンネリングを使って攻撃者マシンからアクセスするのが典型的なパターンです
- **パスワードの再利用を常に疑う。** あるサービスで見つけたクレデンシャルが、SSH、SMB、RDP、データベースなど別のサービスでも通ることは非常に多いです。見つけたパスワードは必ず横展開を試しましょう
- **ハッシュはそのまま使える。** パスワードハッシュをクラックしなくても、Pass-the-HashでSMBやWinRMに認証できます。NTLMハッシュを見つけたらまず直接使うことを考えましょう
- **横展開した先では、再びPost-Exploitationから始める。** 新しいユーザーやホストに入ったら、そこでの権限・環境・情報を改めて収集します。フェーズ3→4→5のサイクルを回す意識が重要です

### Lateral Movementの主なパターン

| パターン | 概要 |
|---------|------|
| クレデンシャルの再利用 | 発見したパスワードで別サービス（SSH, RDP, WinRM等）にログイン |
| Pass-the-Hash | NTLMハッシュを使ってクラックなしで認証 |
| SSHキーの流用 | 他ユーザーの秘密鍵を使ったSSHアクセス |
| トンネリング/ピボット | 内部ネットワークのサービスへのアクセス経路を確保 |
| Kerberos攻撃 | Kerberoasting, AS-REP Roastingによるチケット奪取 |
| データベース経由 | DB内のクレデンシャルやDB権限を使った他ホストへのアクセス |

### 代表的なツール

Lateral Movementで使うツールは、大きく2種類に分かれます。**ピボッティングツール**は内部ネットワークへの通信経路を確保するもの、**横展開ツール**は奪取したクレデンシャルを使って別のホストやユーザーにアクセスするものです。

| 種類 | ツール | ひとこと |
|------|--------|---------|
| ピボッティング | chisel | TCP/HTTPトンネリング。内部ネットワークへのアクセスに |
| ピボッティング | ligolo-ng | インターフェースレベルのトンネリング。chiselより直感的にルーティング可能 |
| ピボッティング | sshuttle | SSH経由の簡易VPN。内部ネットワーク全体をルーティング |
| 横展開 | Evil-WinRM | WinRM経由でWindowsシェルを取得。Pass-the-Hash対応 |
| 横展開 | crackmapexec (nxc) | SMB/WinRM/LDAP等に対するクレデンシャルの一括検証 |
| 横展開 | Impacket | Python製のネットワークプロトコルツール群。psexec, wmiexec, secretsdump等 |

> [!note]
> HTBのStandalone Machineでも「user A → user B → root」というパターンは頻出します。ユーザーを横に移動するフェーズを意識するだけで、攻略の筋道が見えやすくなります。

## フェーズ5: Privilege Escalation（権限昇格）

### このフェーズで何をするのか

一般ユーザーから **root（Linux）またはSYSTEM/Administrator（Windows）** への権限昇格を行うフェーズです。Post-ExploitationやLateral Movementを経て集めた情報をもとに、設定ミスや脆弱性を突きます。

### キーポイント

- **これまでのフェーズの結果がすべて。** 権限昇格の手法自体は限られています。問題は「どのパスが使えるか」を見抜くことで、その答えはPost-ExploitationとLateral Movementで集めた情報の中にあります
- **Linux: `sudo -l` → SUID → Cron → カーネル の順に確認。** 上から順に試して、該当するものがあれば[GTFOBins](https://gtfobins.github.io/)で悪用方法を調べましょう。カーネルExploitは環境を壊すリスクがあるため最後の手段にしてください
- **Windows: トークン権限が最重要。** `whoami /priv` で `SeImpersonatePrivilege` が有効なら、Potato系ツール（JuicyPotato, PrintSpoofer, GodPotato）で即SYSTEMです。サービスアカウントでシェルを取った場合はまずこれを確認しましょう
- **見つからなければPost-Exploitationに戻る。** 「権限昇格できない」のではなく、「まだ情報が足りない」だけのことが多いです

### 主な権限昇格パス（Linux）

| パス | 概要 |
|-----|------|
| sudo悪用 | `sudo -l` でNOPASSWDのコマンドをGTFOBinsで検索 |
| SUIDバイナリ | root所有のSUIDバイナリをGTFOBinsで検索 |
| Cronジョブ | rootが実行するスクリプトへの書き込み |
| PATHハイジャック | 相対パスで実行されるコマンドの乗っ取り |
| Capabilities | `getcap` で見つかるケイパビリティの悪用 |
| カーネルExploit | 最後の手段。linux-exploit-suggesterで候補検索 |

> [!caution]
> カーネルExploitはターゲットのシステムをクラッシュさせるリスクがあります。他のパスをすべて試した後の最終手段と考えてください。HTBではマシンのリセットで復旧できますが、実務では取り返しがつきません。

### 主な権限昇格パス（Windows）

| パス | 概要 |
|-----|------|
| トークン権限 | SeImpersonatePrivilege → Potato系ツール |
| サービス設定ミス | 書き込み可能なサービスバイナリの置き換え |
| AlwaysInstallElevated | MSIインストーラを悪用した権限昇格 |
| 保存されたクレデンシャル | `cmdkey` / `RunAs` での別ユーザー実行 |
| AD攻撃 | BloodHoundで権限昇格パスを可視化 |

### 主要リソース

| プラットフォーム | リソース | 用途 |
|----------------|---------|------|
| Linux | [GTFOBins](https://gtfobins.github.io/) | sudo/SUID/Capabilitiesの悪用方法 |
| Windows | [LOLBAS](https://lolbas-project.github.io/) | LOLBin（Living Off the Land）の悪用方法 |
| Linux | [linux-exploit-suggester](https://github.com/The-Z-Labs/linux-exploit-suggester) | カーネルExploit候補の自動検索 |
| AD | [BloodHound](https://github.com/SpecterOps/BloodHound) | AD攻撃パスの可視化・分析 |

## フェーズ6: Proof（フラグ回収）

### このフェーズで何をするのか

root/SYSTEM権限を取得したら、**フラグを回収して攻略完了**です。HTBでは `user.txt` と `root.txt` を提出します。

```bash showLineNumbers
# Linux
cat /home/<user>/user.txt
cat /root/root.txt

# Windows
type C:\Users\<user>\Desktop\user.txt
type C:\Users\Administrator\Desktop\root.txt
```

### キーポイント

- **フラグの場所はほぼ固定。** HTBではユーザーのホームディレクトリ直下とrootのホームディレクトリ直下です。VulnHubでは `/root/proof.txt` のようなバリエーションもあります
- **攻略後の振り返りを習慣にする。** 「なぜこの脆弱性があったのか」「どのEnumerationが決め手だったか」を振り返ることで、次のマシンでの判断力が上がります

## おわりに

HTB/Boot2Rootの攻略は、一見すると複雑に見えますが、フェーズに分けて考えると **「今何をすべきか」** が明確になります。

ツールの使い方はやっていれば覚えます。それよりも大事なのは、**今自分がどのフェーズにいて、何を目的に動いているのか**を常に意識することです。目的が曖昧なままツールを回しても、出力の山に埋もれるだけで前には進めません。

最後に、一番大事なことを。

**行き詰まったらEnumerationに戻る。** これだけは忘れないでください。

Happy Hacking!
