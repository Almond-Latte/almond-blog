---
title: "PythonでVirusTotalからデータ収集する① - JSON形式で保存するところまで"
description: "ハッシュ値を基にVirusTotalから検知情報を取得するPythonスクリプトを作成します。正常時にJSON形式として保存するところまで。"
pubDate: '2024-03-24'
---

Androidマルウェアの研究をしていて、検体の検知名をVirusTotalから取得することを検討しました。今回はハッシュ値を基にVirusTotalから検知情報を取得するPythonスクリプトを作成してみます。

次回: [PythonでVirusTotalからデータ収集する② - リクエスト制限対策とログ機能実装](/blog/Fetching-VirusTotal-File-Report-2)

## 完成形

完成形は[Githubにて公開](https://github.com/Almond-Latte/Fetching-VirusTotal-File-Report)していますので、そちらも見ていただければと思います。不明点や質問はお気軽にIssueを立ててください！

## VirusTotal API v3

VirusTotal API v3 を使ってハッシュ値を基にファイルレポートを取得します。

APIにはPublic APIとPremium APIがありますが、今回は誰でも取得できるPublic APIを前提としています。それぞれの違いに関しては、[[VirusTotal 公式サイト]Public vs Premium API](https://docs.virustotal.com/reference/public-vs-premium-api) をご確認ください。

Public APIを利用する際の注意点として、リクエスト制限があります。

- 500 Requests / day
- 4 Requests / min

の制限があるので、これを考慮してスクリプトを書きます。

**この考慮は次回のブログで修正を加えます！今回だけでは完成形に至りませんのでご注意ください**

## 1. ハッシュ値リストファイルを用意する

以下のようなハッシュ値の一覧が載ったファイル `hash_list.txt` を用意しておきます。以下の10個ハッシュ値は怪しいAPKのものです。

```plain
00069906B35A3897DAB1D32F6FEE1A5B775954EC342EC4B66A92CE15A7D19890
000DB2A2C11A8EC902E3D586574026E43CB09284F695BCDC1FC0F407EE81B87A
00157C561F3830D24E231295256CB69FE5F49395D7725BD00A755F7C18CE6978
002BCE9A929EFB58F3ED3549FBEB96069B5C70386C15E96540AE3ED1A2C70138
004276D48C32735257852CB5E4FDA26C62E96E69359F2A8F54FD04712556C866
0046DD085DDCA00DD6804614539CC9071BC6A4C541A8FED8CDF364ADFE23FAB6
0068BDCB50252A16A631FA8BEFA85DBF7BE27CFD4177B07546B619929BFE6F2A
00E337BDE3DECF6D1E1412CD94915960CD446DFD49DC4E1FE42CCBFC3894B337
00F2A654C723DE8B4E8917E33B2729F3C3F75BF4580FE2F6D362A3A2E17D9A01
00F2D1C72253B92E494425A7D933BF8E33FCE88F982D0452E06765C49978A407
```

## 2. 最小限のプログラムを書く

今回はPython 3.10以降のバージョンを想定しています。また、なるべく型ヒントをつけています。

```python
import time
from pathlib import Path
from pprint import pprint
from typing import Any

import requests

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"


def call_vt_api(sha256: str) -> dict[str, Any]:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    response = requests.get(VT_API_URL + sha256, headers=headers)
    return response.json()


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
            response: dict[str, Any] = call_vt_api(sha256)
            pprint(response)
            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    main()

```

ここでは、`requests` を使ってVirusTotalにアクセスしています。その際に、HTTP headerとして`x-apikey`を設定することでAPIが利用可能になります。`API_KEY` には自分のものを指定してください

また、これでは収集したデータを標準出力するだけですので再利用性に欠けます。取得したデータをjsonファイルに保存するようにします。

## 3. JSON形式で保存できるようにする

さきほどの最小限のスクリプトでは、取得したデータを標準出力に出力するだけなのでデータの再利用がしにくいです。データをJSON形式で保存するように修正します。

```diff
+ import json
import time
from pathlib import Path
- from pprint import pprint
from typing import Any

import requests

API_KEY: str = "<YOUR_API_KEY>"
HASH_LIST_PATH: Path = Path("hash_list.txt")
+ DOWNLOAD_DIR: Path = Path("vt_reports")
+ DOWNLOAD_DIR.mkdir(exist_ok=True)
VT_API_URL: str = "https://www.virustotal.com/api/v3/files/"


def call_vt_api(sha256: str) -> dict[str, Any]:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    response = requests.get(VT_API_URL + sha256, headers=headers)
    return response.json()


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
            response: dict[str, Any] = call_vt_api(sha256)
-           pprint(response)

+           # Save the response to a file
+           file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
+           with file_path.open("w") as f:
+               f.write(json.dumps(response))

            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    main()

```

ここでは、収集したデータを `vt_reports/{ファイルハッシュ値}.json` として保存するように修正を加えています。

## 4. 簡単なエラー処理を行う

ファイルに保存までできましたが、その内容はきちんとしたファイルレポートではないかもしれません。例えば存在しないハッシュ値をクエリとして投げた場合、VirusTotalはステータスコード404を返します。また、APIキーが間違っている場合などもエラーを返すので、これらは保存しないように修正します。

```json
# ファイルデータが存在しない場合のレスポンスデータ
{
  "error": {
    "code": "NotFoundError",
    "message": "File \"00069906B35A3897DAB1D32F6FEE1A5B775954EC342EC4B66A92CE15A7D19891\" not found"
  }
}
```

```json
# APIキーが間違っている場合のレスポンスデータ
{
  "error": {
    "code": "WrongCredentialsError",
    "message": "Wrong API key"
  }
}
```

`requests` でステータスコードを確認し、`200` であれば保存、それ以外はエラーを出力して保存しないようにします。

```diff
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

- def call_vt_api(sha256: str) -> dict[str, Any]:
+ def call_vt_api(sha256: str) -> dict[str, Any] | None:
    """Call VirusTotal API and return the response."""

    headers: dict[str, str] = {"x-apikey": API_KEY}
    response = requests.get(VT_API_URL + sha256, headers=headers)

+    if response.status_code == 200:
        return response.json()
+    else:
+        print(f"Error: {response.status_code} {response.text}")
+        return None


def main() -> None:
    with HASH_LIST_PATH.open("r") as f:
        for line in f:
            sha256: str = line.strip()
-           response: dict[str, Any] = call_vt_api(sha256)
+           response: dict[str, Any] | None = call_vt_api(sha256)

+           if response is None:
+               continue

            # Save the response to a file
            file_path: Path = DOWNLOAD_DIR.joinpath(sha256 + ".json")
            with file_path.open("w") as f:
                f.write(json.dumps(response))

            time.sleep(15)  # 4 requests per minute


if __name__ == "__main__":
    main()

```

これで簡単なエラー処理を行うことができました。

**まだリクエスト制限に考慮したエラー処理にはなっていません。** こちらは次回のブログで修正を加えます。



## まとめ

今回は正常時にJSON形式で保存するところまでを書きました。

次回ちゃんとしたリクエスト制限に対するエラー処理を書こうと思います。

次回: [PythonでVirusTotalからデータ収集する② - リクエスト制限対策とログ機能実装](/blog/Fetching-VirusTotal-File-Report-2)
