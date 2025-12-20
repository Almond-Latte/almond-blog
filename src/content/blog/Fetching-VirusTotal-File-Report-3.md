---
title: "PythonでVirusTotalからデータ収集する③ - APIキーの安全な運用と設定ファイル"
description: "ハッシュ値を基にVirusTotalから検知情報を取得するPythonスクリプトを作成します。APIキーを用いるスクリプトで、より安全にAPIキーを運用する方法について。"
tags: ["security", "malware", "python"]
pubDate: '2024-05-23'
---

今回は第三回になります。前々回は簡易スクリプトを作り、前回でリクエスト制限時の処理、ログ機能をつけました。

今回はより安全にAPIキーを管理する方法を使って、コードをリファクタリングしていきます。

前々回: [PythonでVirusTotalからデータ収集する① - JSON形式で保存するところまで](/blog/Fetching-VirusTotal-File-Report-1)

前回: [PythonでVirusTotalからデータ収集する② - リクエスト制限対策とログ機能実装](/blog/Fetching-VirusTotal-File-Report-2)

## 完成形

完成形は[Githubにて公開](https://github.com/Almond-Latte/Fetching-VirusTotal-File-Report)していますので、そちらも見ていただければと思います。不明点や質問はお気軽にIssueを立ててください！

## APIキーをよりセキュアに運用したい

前回までのプログラムは以下のようにプログラムにハードコーディングでAPIキーを記述していました。

```python
...
import requests
from zoneinfo import ZoneInfo

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
DOWNLOAD_DIR: Path = Path("vt_reports")
...
```

しかし、**プログラム中にAPIキーが含まれていると、誤ってGitにpushしてしまったり、スクリプトを共有する際にキーが漏れてしまう恐れ**があったりします。ちょっと不安です。

APIキーを使うスクリプトのベストプラクティス(?)に `.env` ファイルを用いたものがあります。一般的に、`.env` ファイルにはAPIキやデータベースのパスワードなどの機密情報が設定され、Gitなどにはpushしない運用をとります。

Pythonでは、[`dotenv`](https://pypi.org/project/python-dotenv/) というライブラリが存在し、このライブラリを用いて `.env` からキーと値のペアを読み込み、これらを環境変数として設定できます。

## python-dotenv

まず、`dotenv` のインストールから行います。

```bash
pip3 install python-dotenv
```

これで準備万端です。`.env` は `settings.py` というファイルと一緒に使われることが多く、`settings.py` の中で `dotenv` ライブラリを呼び出して環境変数のセットを行います。

一番簡単に動くスクリプトは、以下のようなものです。
```python
from dotenv import load_dotenv

load_dotenv()
```

これにより、`.env` に格納されたキーと値のペアが環境変数として使用可能になります。しかし注意しなければいけないのは、**すでに環境変数に設定されているキーの場合、値は上書きされない** ということです。`.env`から読み込んだ値で既存する環境変数を上書きしたい場合、 `load_env(override=True)` というように指定してあげなければなりません。

また、`load_env`関数は環境変数に設定するだけなので、環境変数に設定された値をPython上に読み込むには、また別の処理が必要になります。環境変数の値を取得するには、`os` という標準ライブラリを使います。


ここで、サンプルを動かしてみましょう。例えば、以下のような `.env` ファイルがあるとします。

```bash
SECRET_KEY = "tHIs_ls_mY_P@ssvv0rd"
```

`settings.py`は以下のように書いておきます。

```python
import os

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
print(SECRET_KEY)
```

`settings.py` を実行して、環境変数がきちんと読み込まれていることを確認します。

```bash
$ python3 settings.py
tHIs_ls_mY_P@ssvv0rd
```

## なぜ環境変数がセキュアなのか
環境変数はそのプロセスと子プロセスのみに引き継がれるため、他プロセスから環境変数に保存した機密情報を見られることはありません。このため環境変数を用いる運用がベストプラクティスであると言われるのだと思います。

一方で、ネット上には `/proc/$PID/environ` を読むことでそのプロセスで有効な環境変数を確認することができると書かれていることもあります。これができてしまえば、よりセキュアに運用するために `dotenv` を導入したのに本末転倒です。

確かめてみましょう。

以下のように `settings.py` を編集、コマンドを実行してみます。

```diff
import os
+ from time import sleep

from dotenv import load_dotenv

load_dotenv()
+ sleep(3600)

SECRET_KEY = os.getenv("SECRET_KEY")
print(SECRET_KEY)

```

```shell
$ python3 settings.py &
[1] 119868
$ echo $!
119868
$ xargs -0 -L1 -a /proc/$!/environ | grep SECRET
$
```

`settings.py` で `load_dotenv()` (環境変数に書き込み) をした後に待機し、`settings.py` が動いているPIDを元に `environ` を参照、`SECRET` が含まれる環境変数を探してみますが見当たりません。

実は `environ` は読み取り専用であり、ここに設定されるのは初期の環境変数です。`settings.py` が書き込んだ環境変数は `environ` へ反映されることはないので、たとえ `/proc/$PID/environ` が見られてしまっても機密情報が漏れることはありません。

```shell
$ ls -al /proc/$!/environ
-r-------- 1 user group 0 May 22 00:00 /proc/119868/environ
```
また、パーミッションからわかるとおり `environ` はファイル所有者しか読み取ることはできないので、他ユーザから盗み見られることもありません。

以上より、機密情報等は環境変数で管理することに納得がいきます。

## 実装する

ではここからより実用的に実装します。以下のようにしてみました。

```python
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console

console = Console()


def get_env(key: str) -> str:
    """Load environment variable and return it."""
    val = os.getenv(key)
    if val is None:
        console.log(
            f"Error: {key} is not set as an environment variable. \
            Consider adding {key} to the .env file."
        )
        sys.exit()
    return val


dirname: Path = Path(__file__).parent

# Read .env File
dotenv_path: Path = Path.joinpath(dirname, ".env")
load_dotenv(dotenv_path, override=True)
API_KEY: str = get_env("API_KEY")
HASH_LIST_PATH: Path = Path(get_env("HASH_LIST_PATH"))
```

ここで、新しいライブラリである `rich` を使っています。このライブラリはその名の通り**標準出力をリッチにする**ために用いることができ、CLIアプリケーションを作るときなどに重宝します。実は `pip` なんかも `rich` が内部で使われています。またいつかの機会にでもブログに書けたらと思います。

`get_env` 関数は環境変数 `key` の値を読み取るためのものですが、`.env` ファイルに正しく環境変数が設定されていない場合には標準出力にその旨を出力して `settings.py` の処理を終えるようになっています。

27行目で `.env` から環境変数を設定し、28-29行目で `get_env` を使って環境変数から取得しています。
ここでは `API_KEY` と `HASH_LIST_PATH` を取得しているので、 `.evn` ファイルもそのように編集しておきます。

```bash
# General Settings
API_KEY = "<Your API Key>"
HASH_LIST_PATH = "hash_list.txt"
```

さらに、`get_file_report.py` を `settings.py` から情報を引っ張ってくるように変更しましょう。

```diff
import json
import time
from datetime import datetime, timedelta, timezone
from logging import INFO, FileHandler, Formatter, getLogger
from pathlib import Path
from typing import Any

import requests
from zoneinfo import ZoneInfo

+ import settings.py

- API_KEY: str = "<YOUR_API_KEY>"
- HASH_LIST_PATH: Path = Path("hash_list.txt")
+ API_KEY: str = settings.API_KEY
+ HASH_LIST_PATH: Path = settings.HASH_LIST_PATH
DOWNLOAD_DIR: Path = Path("vt_reports")
DOWNLOAD_DIR.mkdir(exist_ok=True)
LOG_FILE_PATH: Path = Path.joinpath(
    Path(__file__).parent,
    Path("log"),
    Path(f"{datetime.now(ZoneInfo('Asia/Tokyo')):%Y%m%d_%H%M%S}.log"),
)
LOG_FILE_PATH.parent.mkdir(exist_ok=True)
LOG_FILE_PATH.touch(exist_ok=True)
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"

# init logger
...
```

これで `get_file_report.py` にAPIキーをハードコーディングする必要は無く、より安全にAPIキーを運用できるようになりました

## 雑多な処理を `settings.py` にまとめる

ここで終わっても良いのですが、せっかく `settings.py` を作ったので、直接的な処理には関係しない雑多な処理（ダウンロードパスの設定やログファイルパスの設定など）もそちらにまとめたいと思います。

```diff
import os
import sys
+ from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console
+ from zoneinfo import ZoneInfo

console = Console()


def get_env(key: str) -> str:
    """Load environment variable and return it."""
    val = os.getenv(key)
    if val is None:
        console.log(
            f"Error: {key} is not set as an environment variable. \
            Consider adding {key} to the .env file."
        )
        sys.exit()
    return val


dirname: Path = Path(__file__).parent

+ # create log directory
+ log_dir_path: Path = Path.joinpath(dirname, Path("log"))
+ log_dir_path.mkdir(exist_ok=True)

+ # create log file
+ LOG_FILE_PATH: Path = Path.joinpath(
+    log_dir_path,
+    Path(f"{datetime.now(ZoneInfo('Asia/Tokyo')):%Y%m%d_%H%M%S}.log"),
+ )
+ LOG_FILE_PATH.touch(exist_ok=True)

+ # create download directory
+ DOWNLOAD_DIR: Path = Path.joinpath(dirname, "vt_reports")
+ DOWNLOAD_DIR.mkdir(exist_ok=True)

# Read .env File
dotenv_path: Path = Path.joinpath(dirname, ".env")
load_dotenv(dotenv_path, override=True)
API_KEY: str = get_env("API_KEY")
HASH_LIST_PATH: Path = Path(get_env("HASH_LIST_PATH"))
```

```diff
import json
import time
from datetime import datetime, timedelta, timezone
from logging import INFO, FileHandler, Formatter, getLogger
from pathlib import Path
from typing import Any

import requests
- from zoneinfo import ZoneInfo

import settings

+ # load settings
API_KEY: str = settings.API_KEY
HASH_LIST_PATH: Path = settings.HASH_LIST_PATH
- DOWNLOAD_DIR: Path = Path("vt_reports")
- DOWNLOAD_DIR.mkdir(exist_ok=True)
- LOG_FILE_PATH: Path = Path.joinpath(
-   Path(__file__).parent,
-   Path("log"),
-   Path(f"{datetime.now(ZoneInfo('Asia/Tokyo')):%Y%m%d_%H%M%S}.log"),
- )
- LOG_FILE_PATH.parent.mkdir(exist_ok=True)
- LOG_FILE_PATH.touch(exist_ok=True)
+ LOG_FILE_PATH: Path = settings.LOG_FILE_PATH
+ DOWNLOAD_DIR: Path = settings.DOWNLOAD_DIR
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"

# init logger
...
```

これでちょっと `get_file_report.py` がすっきりしました

こんな感じで長々と作ってきたスクリプトですが、完成形は[Githubにて公開](https://github.com/Almond-Latte/Fetching-VirusTotal-File-Report)しています。

ではよりよい研究ライフを！
