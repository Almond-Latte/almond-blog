---
title: "PythonでVirusTotalからデータ収集する② - リクエスト制限対策とログ機能実装"
description: "ハッシュ値を基にVirusTotalから検知情報を取得するPythonスクリプトを作成します。Public APIのリクエスト制限を考慮し、さらにログ機能の実装をする。"
pubDate: '2024-05-08'
---

前回はVirusTotal API v3を使って正常リクエスト時にファイルレポートを保存するところまで作成しました。

今回はさらにPublic APIのリクエスト制限を考慮したスクリプトに昇格させて、ログまで取ります。

前回: [PythonでVirusTotalからデータ収集する① - JSON形式で保存するところまで](/blog/Fetching-VirusTotal-File-Report-1)
次回: [PythonでVirusTotalからデータ収集する③ - APIキーの安全な運用と設定ファイル](/blog/Fetching-VirusTotal-File-Report-3)

# 完成形

完成形は[Githubにて公開](https://github.com/Almond-Latte/Fetching-VirusTotal-File-Report)していますので、そちらも見ていただければと思います。不明点や質問はお気軽にIssueを立ててください！

#  リクエスト制限

Public APIを利用する際の注意点として、リクエスト制限があります。

- 500 Requests / day
- 4 Requests / min

の制限があるので、これを考慮してスクリプトを書きます。

前回までのスクリプトは以下のようになっています。

```python
import json
import time
from pathlib import Path
from typing import Any

import requests

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
DOWNLOAD_DIR: Path = Path("vt_reports")
DOWNLOAD_DIR.mkdir(exist_ok=True)
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"


def call_vt_api(sha256: str) -> dict[str, Any] | None:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    response = requests.get(VT_API_URL + sha256, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} {response.text}")
        return None


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
            response: dict[str, Any] | None = call_vt_api(sha256)

            if response is None:
                continue

            # Save the response to a file
            file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
            with file_path.open("w") as f:
                f.write(json.dumps(response))

            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    main()

```

# リクエスト制限にかかったら真夜中まで待つ

[VirusTotal APIのリファレンス](https://docs.virustotal.com/reference/errors) を見てみると、 リクエスト制限にかかった場合、`QuotaExceededError` というエラーコード `429` のエラーが返されることが書かれています。また、次のような文言が記載されています。

>Daily quotas are reset every day at 00:00 UTC.

 よって、リクエスト制限に掛かった場合は 00:00 UTCまでとりあえず待機すれば良いことがわかります。これらを元にスクリプトを改善していきます。

まず、00:00 UTC まで待機するような関数を作成します。

```python
from datetime import datetime, timedelta, timezone
```

```python
def wait_until_utc_midnight() -> None:
    """Wait until UTC midnight."""
    now: datetime = datetime.now(timezone.utc)
    tomorrow: datetime = now + timedelta(days=1)
    midnight: datetime = datetime(
        year=tomorrow.year,
        month=tomorrow.month,
        day=tomorrow.day,
        hour=0,
        minute=0,
        second=0,
        tzinfo=timezone.utc,
    )
    # calculate wait seconds
    wait_seconds: int = (midnight - now).seconds
    time.sleep(wait_seconds)
```

ここでは、`datetime` を使って、現在時刻 `now` と現在から1日後の時間 `tomorrow` を取得しています。00:00 UTCは `tomorrow` の午前0時のことなので、`midnight` はそのように設定します。

最後に、`midnight` と `now` の差分を取ってその秒数だけsleepすれば00:00 UTCまで待つ処理の完成です。

この処理のトリガーは、前述したようにエラーコード `429` が返ってきたことにすればいいでしょう。以下のように実装できます。

```python
if response.status_code == 429:
    print("QuotaExceededError... waiting until UTC 00:00 to request again")
    wait_until_utc_midnight()
    call_vt_api(sha256) # call_vt_api関数でエラー時のハッシュをリトライする
```

これをスクリプトに合うよう組み込んだものが以下になります。

```diff
import json
import time
+ from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import requests

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
DOWNLOAD_DIR: Path = Path("vt_reports")
DOWNLOAD_DIR.mkdir(exist_ok=True)
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"


def call_vt_api(sha256: str) -> dict[str, Any] | None:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    response = requests.get(VT_API_URL + sha256, headers=headers)

    if response.status_code == 200:
        return response.json()
+   # handle QuotaExceededError
+   elif response.status_code == 429:
+       print("QuotaExceededError... waiting until UTC 00:00 to request again")
+       wait_until_utc_midnight()
+       return call_vt_api(sha256)  # retry
    else:
        print(f"Error: {response.status_code} {response.text}")
        return None


+ def wait_until_utc_midnight() -> None:
+   """Wait until UTC midnight."""
+   now: datetime = datetime.now(timezone.utc)
+   tomorrow: datetime = now + timedelta(days=1)
+   midnight: datetime = datetime(
+       year=tomorrow.year,
+       month=tomorrow.month,
+       day=tomorrow.day,
+       hour=0,
+       minute=0,
+       second=0,
+       tzinfo=timezone.utc,
+   )
+   # calculate wait seconds
+   wait_seconds: int = (midnight - now).seconds
+   time.sleep(wait_seconds)


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
            response: dict[str, Any] | None = call_vt_api(sha256)

            if response is None:
                continue

            # Save the response to a file
            file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
            with file_path.open("w") as f:
                f.write(json.dumps(response))

            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    main()

```

これでVirusTotal側に迷惑をかけることなくデータフェッチが可能になりました。


# ログ機能をつける

ここまででエラー処理を行ってきました。しかし、エラーが起きた際にどのハッシュ値でエラーが起きたのか記録しておかなければ、実用性がありません。そこで、`logging` を使ったログ機能をつけてみます。
loggingにはいろいろなやり方がありますが、 `Python logging Best Practices` と検索してみるといいです。また、Pythonのドキュメントにも [Logging HOWTO](https://docs.python.org/ja/3/howto/logging.html) がありますので、こちらも必要に応じて参照してください。

ここでは、ログ取得にあたり以下のような要件を満たすようにします。
```txt
【要件1】日時を把握できる
【要件2】再度実行した際に、以前のログを書き換えない
【要件3】あるハッシュ値に関して、APIにリクエストを送ったことがわかる
【要件4】リクエスト制限にかかったことがわかる
【要件5】リクエストがエラーになったことが分かる(404等)
【要件6】リクエストが正常に処理され、データを保存できたことがわかる
【要件7】プログラム全体が正常終了したことがわかる
```

以上を考慮したスクリプトを実装します。

また、ここでは `logging.info()` のようにルートロガーを使うことは避け、`getLogger` で自前のロガーを用意することにします。これについては以下のようなサイトが参考になると思います。


[ログ出力のための print と import logging はやめてほしい](https://qiita.com/amedama/items/b856b2f30c2f38665701)

```python
from logging import INFO, getLogger
```
```python
logger = getLogger(__name__)
logger.setLevel(INFO)
```

## 【要件1】日時を把握できる

当たり前ですが、日時を把握できなければログを取る意味がありません（というのは今回のスクリプトにおいて過言かもしれませんが、日時を記録しないログはほとんどありえないと思います）。

日時をログのフォーマットに加えます。`logging` の `Formatter` を用いてフォーマットを以下のように指定します。
```python
from logging import Formatter
```
```python
formatter = Formatter("%(asctime)s - %(levelname)8s - %(message)s")
```
```txt
%(asctime)s     ... 時間。"2003-07-08 16:49:45,896" 形式。
%(levelname)8s  ... ロギングレベル。"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL" がある。幅を8文字分に合わせている。
%(message)s     ... ログメッセージ。ログに記録したいことを自分で設定する。
```
これらは `LogRecord Attributes` と呼ばれます。詳細は、[LogRecord Attributes](https://docs.python.org/ja/3/library/logging.html#logrecord-attributes) を見てみるといいと思います。

例えば、`logging.info("Hello")` や、`logging.critical("World")` とすれば、以下のような形式でログがとれます。
```log
2024-05-07 18:53:28,535 -     INFO - Hello
2024-05-07 18:53:28,535 - CRITICAL - World
```

## 【要件2】以前のログを書き換えない
ログはファイルに記録するとし、実行のたびに以前のログを書き換えないようにします。今回はログを記録するファイル名を実行した日時にします。

```python
from logging import FileHandler
```
```python
LOG_FILE_PATH: Path = Path.joinpath(
    Path(__file__).parent,
    Path("log"),
    Path(f"{datetime.now(ZoneInfo('Asia/Tokyo')):%Y%m%d_%H%M%S}.log"),
)
LOG_FILE_PATH.parent.mkdir(exist_ok=True)
LOG_FILE_PATH.touch(exist_ok=True)
...
handler = FileHandler(LOG_FILE_PATH)

```

これにより、例えば2024年5月7日18時53分28秒に実行したスクリプトのログは、`20240507_185328.log` というようなファイル名になります。


## 【要件3】リクエストを送ったことが分かる
リクエストを送る直前に、以下のような処理を加えます。
```diff
    headers: dict[str, str] = {"x-apikey": API_KEY}
+   logger.info(f"requesting {sha256}")
    # request to VirusTotal
    response = requests.get(VT_API_URL + sha256, headers=headers)
```


## 【要件4】リクエスト制限にかかったことが分かる
リクエスト制限にかかったことも記録しておきましょう。
```diff
if response.status_code == 429:
+   logger.warning(
+       "QuotaExceededError... waiting until UTC 00:00 to request again"
+   )
    wait_until_utc_midnight()

```

## 【要件5】リクエストがエラーになったことが分かる
リクエストを送ったが、正常に取得できなかった場合のエラー内容も記録しておきます。
```diff
if response.status_code == 200:
    ...
else:
+   logger.error(f"Error: {response.status_code} {response.text}")
    return None
```

## 【要件6】データを保存できたことが分かる
エラーだけでなく、正常に処理できたことも記録しておきます。
```diff
# Save the response to a file
file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
with file_path.open("w") as f:
    f.write(json.dumps(response))
+   logger.info(f"saved {sha256}.json")

```

## 【要件7】プログラム全体が正常終了したことがわかる
Pythonスクリプト自体が途中で停止していないことを確認するために、処理全体の開始と終了をログに取っておきます。
```diff
if __name__ == "__main__":
+   logger.info("start")
    main()
+   logger.info("end")
```

## ログ結果
実際にスクリプトを動かした時のログを以下に示します。
```log
2024-05-07 18:53:28,059 -     INFO - start
2024-05-07 18:53:28,067 -     INFO - requesting 00069906B35A3897DAB1D32F6FEE1A5B775954EC342EC4B66A92CE15A7D19891
2024-05-07 18:53:28,534 -    ERROR - Error: 404 {
    "error": {
        "code": "NotFoundError",
        "message": "File \"00069906B35A3897DAB1D32F6FEE1A5B775954EC342EC4B66A92CE15A7D19891\" not found"
    }
}
2024-05-07 18:53:28,535 -     INFO - requesting 000DB2A2C11A8EC902E3D586574026E43CB09284F695BCDC1FC0F407EE81B87A
2024-05-07 18:53:28,985 -     INFO - saved 000DB2A2C11A8EC902E3D586574026E43CB09284F695BCDC1FC0F407EE81B87A.json
2024-05-07 18:53:44,000 -     INFO - requesting 00157C561F3830D24E231295256CB69FE5F49395D7725BD00A755F7C18CE6978
2024-05-07 18:53:44,471 -     INFO - saved 00157C561F3830D24E231295256CB69FE5F49395D7725BD00A755F7C18CE6978.json
2024-05-07 18:53:59,486 -     INFO - requesting 002BCE9A929EFB58F3ED3549FBEB96069B5C70386C15E96540AE3ED1A2C70138
2024-05-07 18:54:00,003 -     INFO - saved 002BCE9A929EFB58F3ED3549FBEB96069B5C70386C15E96540AE3ED1A2C70138.json
2024-05-07 18:54:15,017 -     INFO - requesting 004276D48C32735257852CB5E4FDA26C62E96E69359F2A8F54FD04712556C866
2024-05-07 18:54:15,449 -     INFO - saved 004276D48C32735257852CB5E4FDA26C62E96E69359F2A8F54FD04712556C866.json
2024-05-07 18:54:30,463 -     INFO - requesting 0046DD085DDCA00DD6804614539CC9071BC6A4C541A8FED8CDF364ADFE23FAB6
2024-05-07 18:54:31,056 -     INFO - saved 0046DD085DDCA00DD6804614539CC9071BC6A4C541A8FED8CDF364ADFE23FAB6.json
2024-05-07 18:54:46,071 -     INFO - requesting 0068BDCB50252A16A631FA8BEFA85DBF7BE27CFD4177B07546B619929BFE6F2A
2024-05-07 18:54:46,501 -     INFO - saved 0068BDCB50252A16A631FA8BEFA85DBF7BE27CFD4177B07546B619929BFE6F2A.json
2024-05-07 18:55:01,517 -     INFO - requesting 00E337BDE3DECF6D1E1412CD94915960CD446DFD49DC4E1FE42CCBFC3894B337
2024-05-07 18:55:02,059 -     INFO - saved 00E337BDE3DECF6D1E1412CD94915960CD446DFD49DC4E1FE42CCBFC3894B337.json
2024-05-07 18:55:17,074 -     INFO - requesting 00F2A654C723DE8B4E8917E33B2729F3C3F75BF4580FE2F6D362A3A2E17D9A01
2024-05-07 18:55:17,600 -     INFO - saved 00F2A654C723DE8B4E8917E33B2729F3C3F75BF4580FE2F6D362A3A2E17D9A01.json
2024-05-07 18:55:32,615 -     INFO - requesting 00F2D1C72253B92E494425A7D933BF8E33FCE88F982D0452E06765C49978A407
2024-05-07 18:55:33,164 -     INFO - saved 00F2D1C72253B92E494425A7D933BF8E33FCE88F982D0452E06765C49978A407.json
2024-05-07 18:55:48,180 -     INFO - end

```
# プログラム全体
というわけでリクエスト制限対策とログ機能実装までを行ったスクリプトは以下のようになりました。

```python
import json
import time
from datetime import datetime, timedelta, timezone
from logging import INFO, FileHandler, Formatter, getLogger
from pathlib import Path
from typing import Any

import requests
from zoneinfo import ZoneInfo

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
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
logger = getLogger(__name__)
logger.setLevel(INFO)
handler = FileHandler(LOG_FILE_PATH)
formatter = Formatter("%(asctime)s - %(levelname)8s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


def call_vt_api(sha256: str) -> dict[str, Any] | None:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    logger.info(f"requesting {sha256}")
    # request to VirusTotal
    response = requests.get(VT_API_URL + sha256, headers=headers)

    # handle success
    if response.status_code == 200:
        return response.json()
    # handle QuotaExceededError
    elif response.status_code == 429:
        logger.warning(
            "QuotaExceededError... waiting until UTC 00:00 to request again"
        )
        wait_until_utc_midnight()
        return call_vt_api(sha256)  # retry
    else:
        logger.error(f"Error: {response.status_code} {response.text}")
        return None


def wait_until_utc_midnight() -> None:
    """Wait until UTC midnight."""
    now: datetime = datetime.now(timezone.utc)
    tomorrow: datetime = now + timedelta(days=1)
    midnight: datetime = datetime(
        year=tomorrow.year,
        month=tomorrow.month,
        day=tomorrow.day,
        hour=0,
        minute=0,
        second=0,
        tzinfo=timezone.utc,
    )
    # calculate wait seconds
    wait_seconds: int = (midnight - now).seconds
    time.sleep(wait_seconds)


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
            response: dict[str, Any] | None = call_vt_api(sha256)

            if response is None:
                continue

            # Save the response to a file
            file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
            with file_path.open("w") as f:
                f.write(json.dumps(response))
                logger.info(f"saved {sha256}.json")

            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    logger.info("start")
    main()
    logger.info("end")

```


# まとめ

今回はリクエスト制限にかかった時の処理と、ログ機能をつけました。

ちょっと分量が多くなった & これだとプログラム中にAPIキーが含まれてしまいます。

**プログラム中にAPIキーが含まれていると、誤ってGitにpushしてしまったり、スクリプトを共有する際にキーが漏れてしまう恐れ**があったり、ちょっと不安です。

APIキーを使うスクリプトのベストプラクティス(?)に `.env` ファイルを用いたものがあるので、次回は `settings.py` と `.env` ファイルを追加して完成形までもっていきたいと思います。

次回: [PythonでVirusTotalからデータ収集する③ - APIキーの安全な運用と設定ファイル](/blog/Fetching-VirusTotal-File-Report-3)
