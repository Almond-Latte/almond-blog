---
title: 'Ubuntu Server 22.04.03 のインストール後にやる最低限の設定'
excerpt: 'ブログ公開にあたり、自宅サーバでの運用を初めてみようと思います。それに伴い、Ubuntu Server 22.04.03 の最低限の設定をいろいろやったので備忘録として残しておきます。'
postDate: '2023-10-18T14:56:06+09:00'
lastmod: '2023-10-18T14:56:06+09:00'
coverImage: '/assets/blog/coverImage/ServerRack.jpg'
ogImage:
  url: '/assets/blog/coverImage/UbuntuServerSetup2023.svg'
tags: ['Linux', 'Ubuntu']
---

ブログ公開にあたり、自宅サーバでの運用を初めてみようと思います。それに伴い、Ubuntu Server 22.04.03 の最低限の設定を行ったので、備忘録として残しておきます。

# 環境

| マシン                    | ディストリビューション            |
| ------------------------- | --------------------------------- |
| Raspberry Pi 4B (8GB RAM) | Ubuntu Server 22.04.3 LTS (64bit) |

# ユーザ追加とsudo権限付与

初期ユーザが`ubuntu`で作成されていたので、新たにユーザを追加。

``` bash
sudo adduser ${USERNAME}
```

`useradd`ではなく`adduser`。

`adduser`は対話形式でユーザ追加・設定を行うが、`useradd`はユーザ作成以外はオプション指定。

パスワードだけ設定し、他の項

```bash
Full Name []:
Room Number []:
Work Phone []:
Home Phone []:
Other []:
```

は入力せずエンター。

続けて、sudo権限付与。

```bash
sudo gpasswd -a ${USERNAME} sudo
```

ユーザ切り替えと権限確認

```bash
su ${USERNAME}
```

```bash
groups ${USERNAME}
```

sudo権限が付与されていることを確認。

初期ユーザ`ubuntu`は不要なので削除。

```bash
sudo userdel -r ${USERNAME}
```

```bash
user ${USERNAME} is currently used by process PID
```

と出て削除失敗。`kill PID`によりプロセスを停止するが、これでも上手くいかず。

`kill -kill PID`とすることでログアウトされ、新しいユーザでログインできた。

#  ホスト名変更

`hostname`で変更すると再起動時に元にもどるので、`hostnamectl`で変更する。

```bash
hostnamectl set-hostname ${HOSTNAME}
```

`hostnamectl`で`Static hostname`が変わっていたらOK。

# ネットワーク関連

## IPアドレス

`netplan`を用いて固定IP設定を行う。設定ファイルは`/etc/netplan/`に存在する。

一応システムファイル内なので、デフォルトファイル`50-cloud-init-yaml`は削除せずに、`99_config.yaml`を作成し記述することが推奨されているみたい。

先に、

```bash
ip a
```

によりインターフェースを確認する。

```bash
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:15:5d:82:2f:1c brd ff:ff:ff:ff:ff:ff
    inet 172.18.88.12/20 brd 172.18.95.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::215:5dff:fe82:2f1c/64 scope link
       valid_lft forever preferred_lft forever
```

こんな感じの画面が出てくる。`eth0`が有線なのでこれに対し設定。

```yaml
# 99_config.yaml
```

なお、`gateway4`で設定することは非推奨(deprecated)。

```bash
sudo netplan apply
```

で設定を適用する。

### Warning関連
僕の環境では以下のWarningが出たのでメモしておく。

**設定ファイルの権限**

```bash
WARNING **: Permissions for /etc/netplan/99_config.yaml are too open. Netplan configuration should NOT be accessible by others.
```

と出ることがある。この場合はファイル権限を絞ればいい。

```bash
sudo chmod 600 /etc/netplan/99_config.yaml
```

**Raspberry Pi特有(?)の警告**

```bash
WARNING:root:Cannot call Open vSwitch: ovsdb-server.service is not running.
```

どうやらUbuntu 22.04で報告されたバグらしい？今のところ問題ないので放置。

[参考](https://bugs.launchpad.net/ubuntu/+source/netplan.io/+bug/1995598)

`ip a`, `ip route`で適用されているか確認。名前解決できるかは以下で確認できる。

```bash
curl google.com
```
### ネットワーク待ちで起動が遅い

起動時にネットワーク構成待ちになり、大体2分かかる。

```bash
A start job is running for wait for network to be configured.
```

`99_config.yaml`に`optional: true`を追加すればいいらしいが、解決せず。放置。

[参考](https://askubuntu.com/questions/1118283/50-cloud-init-yaml-optional-true-will-the-network-interface-get-initialized)


# SSH設定

## サービスの自動起動

```bash
sudo systemctl enable ssh
```

## ファイアウォールの設定

```bash
sudo ufw enable
sudo ufw default deny
sudo ufw allow 22/tcp
sudo ufw reload
```

```bash
$ sudo ufw status
Status: active

To                      Action      From
--                      ------      ----
22/tcp                  ALLOW       Anywhere
22/tcp (v6)             ALLOW       Anywhere (v6)
```

となればOK。

## 公開鍵認証設定

### 鍵生成

今回はUbuntu ServerをRaspberry Piで運用するので、ソレ用に生成。RSAはもう古いので、ed25519で生成する（OpenSSH ver6.5以上）。

```bash
ssh-keygen -t ed25519 -C "Raspberry Pi" -f ~/.ssh/id_ed25519_rasp
```

### 公開鍵共有

```bash
ssh-copy-id -i ${identity_file} ${USERNAME}@${TARGET_HOSTNAME}
```

### 接続確認

```bash
ssh -i ${identity_file} ${USERNAME}@${TARGET_HOSTNAME}
```

パスワード認証を求められなければOK。これ以降は、SSH接続で設定を行う。

## SSH設定ファイルの変更

`/etc/ssh/sshd_config`を修正して、

- ポート番号変更
- rootログイン禁止
- パスワード認証の禁止

を行う。一応、バックアップを取っておくと無難。

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

### 新しいポート番号を追加

ポート番号を`2222`に変更する場合。接続できることを確認後、`Port 22`を削除する。変更により閉め出されることを防止するため。

ポート番号はランダムであることが望ましい。新しく開通したいポートが重複しないかは以下で調べられる。何も出なければOK。

```bash
ss -atn | grep ${DESIRED_PORT}
```

`/etc/ssh/sshd_config`に以下を追記

```diff
Port 22
+ Port 2222
```

### rootログイン禁止

```diff
- #PermitRootLogin prohibit-password
+ PermitRootLogin no
```

### パスワード認証の禁止

`PasswordAuthentication`という項目を`no`にすればよいが、僕の環境ではこれが始めから`no`になっているにもかかわらずパスワード認証ができた。調べてみると、デフォルトで`/etc/ssh/sshd_config.d/50-cloud-init.conf`なるファイルが存在。この中に`PasswordAuthentication yes`という記載があり、これをコメントアウトした。

```diff
- PasswordAuthentication yes
+ PasswordAuthentication no
```

### ファイアウォールで新しいポート番号を公開

```bash
sudo ufw allow 2222/tcp
sudo ufw reload
```

### sshサービスの再起動その１

接続できなくなったら困るので、別のターミナルでSSH接続しておく。

```bash
sudo systemctl restart sshd
```

### 接続確認 その１

新たに設定したポート番号で接続できるか確認する。

```bash
ssh -i ${identity_file} -p 2222 ${USERNAME}@${HOSTNAME}
```

接続できればOK。

### ファイアウォールで古いポート番号を閉鎖

```bash
sudo ufw delete allow 22/tcp
sudo ufw reload
```

### 古いポート番号をsshd_configから消す

```diff
- Port 22
```

### sshサービスの再起動その２

```bash
sudo systemctl restart sshd
```

### 接続確認 その２

異常系が全て弾かれればOK。

#### 正常系

```bash
ssh -i ${identity_file} -p 2222 ${USERNAME}@${HOSTNAME}
```

#### 異常系1 (ポート番号が22)

```bash
ssh -i ${identity_file} ${USERNAME}@${HOSTNAME}
```

#### 異常系2 (パスワード認証)

```bash
０ssh -p 2222 ${USERNAME}@${HOSTNAME}
```

#### 異常系3 (rootログイン)

```bash
ssh -i ${identity_file} -p 2222 root@${HOSTNAME}
```

### `~/.ssh/config`の設定

`~/.ssh/config`を設定することで、簡単にssh接続できるようにする。

```bash
Host ${HOST}
	HostName ${HOSTNAME}
	User ${USERNAME}
	Port ${PORT}
	IdentityFile ${Identity_file}
```

例えば、コンピュータのアドレスが`192.168.1.100`, ユーザ名`user01`, ポート番号`2222`, 秘密鍵の場所が`~/.ssh/id_ed25519`ならば、

```bash
Host mycomputer
	HostName 192.168.1.100
	User user01
	Port 2222
	IdentityFile ~/.ssh/id_ed25519
```

とすれば、

```bash
ssh mycomputer
```

でSSH接続できるようになる。

# 開発環境設定

```bash
sudo apt update
sudo apt -y upgrade
sudo apt install -y build-essential
```

これである程度入る。

# タイムゾーンの変更

```bash
$ timedatectl status
               Local time: Wed 2023-10-18 05:52:40 UTC
           Universal time: Wed 2023-10-18 05:52:40 UTC
                 RTC time: n/a
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

タイムゾーンが`UTC`(協定世界時)になっているので、`JST`(日本標準時)に変更する。

```bash
$ sudo timedatectl set-timezone Asia/Tokyo
$ timedatectl status
               Local time: Wed 2023-10-18 14:54:45 JST
           Universal time: Wed 2023-10-18 05:54:45 UTC
                 RTC time: n/a
                Time zone: Asia/Tokyo (JST, +0900)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

`date`コマンドで`ISO8061 format`の日付が取得できるようになった。

```bash
$ date +"%Y-%m-%dT%H:%M:%S%:z"
2023-10-18T14:56:06+09:00
```

全サービスのログに影響するので、ホスト自体を再起動したほうがいい。

# vimの設定

以下のように`~/.vimrc`を記述する。

```vim:~/.vimrc
"====== 表示設定 ======
syntax on "シンタックスを有効に
set number "行番号
set list "空白やタブを見えるようにする
set listchars=tab:»-,trail:-,eol:↲,extends:»,precedes:«,nbsp:% "制御文字の見え方設定
"====== 文字コード関連 ======
set encoding=utf-8 "vimの内部文字コード
set fileencoding=utf-8 "ファイル書き込み時の文字コード
set fileencodings=utf-8 "ファイル読み込み時の文字コード
"====== 検索関連 ======
set hlsearch "検索結果をハイライトする
set ignorecase "大文字と小文字を区別しない
"Esc2度押しでハイライト解除
nmap <Esc><Esc> :nohlsearch<Enter>
"====== インデント ======
set expandtab "タブをスペースに変換
set tabstop=2 "タブをスペース2つに
set shiftwidth=2 "読み込み時のタブをスペース2つに
set smartindent "自動でインデント設定
"====== その他 ======
set virtualedit=block "矩形選択で文字がなくても進める
set whichwrap=b,s,h,l,[,],<,>,~ "行をまたいで移動できる
" jjでEscする
inoremap <silent> jj <Esc>
set belloff=all "ビープ音を消す
```

マシンを自分だけしか使わないなら、`sudo vim`したときにもこれが反映されるようにシンボリックリンクを張る。

```bash
sudo ln -s ~/.vimrc /root/.vimrc
```

複数人でつかうマシンの場合は、

```bash
sudo vim -u ~/.vimrc
```

と毎回打てばOK。

# Git関連

## ユーザ情報を設定

```bash
git config --global user.name "Almond-Latte"
git config --global user.email "147462539+Almond-Latte@users.noreply.github.com"
```

## 標準エディタをvimにする

```bash
git config --global core.editor 'vim'
```

## SSH秘密鍵設定

### 鍵生成

```bash
ssh-keygen -t ed25519 -C "https://github.com/Almond-Latte/almond-blog.git" -f ~/.
ssh/id_ed25519_git-almond-blog
```

### GitHubに公開鍵登録

[GitHubのSSH keys](https://github.com/settings/ssh)に`.pub`の方をコピペして登録。

### 接続確認

```bash
$ ssh -T git@github.com -i ~/.ssh/id_ed25519_git-almond-blog
Hi Almond-Latte! You've successfully authenticated, but GitHub does not provide shell access.
```

### `~/.ssh/config`の設定

```bash
Host github github.com
  HostName github.com
  IdentityFile ~/.ssh/id_ed25519_git-almond-blog
  User git
```

`ssh -T github`で接続できればOK。



