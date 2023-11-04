---
title: 'Zenn独自のMarkdown記法が使えるかのテスト記事'
postDate: '2023-10-18T14:56:06+09:00'
updateDate: '2023-10-18T14:56:06+09:00'
excerpt: 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test '
---

## 見出し
```md
# 見出し1
## 見出し2
### 見出し3
#### 見出し4
```

## リスト
```md
- Hello!
- Hola!
  - Bonjour!
  * Hi!
```
- Hello!
- Hola!
  - Bonjour!
  * Hi!

## 番号付きリスト
```md
1. First
1. Second
```
1. First
1. Second

## テキストリンク
```md
[アンカーテキスト](リンクのURL)
```
[アンカーテキスト](zenn-markdown)

## 画像
```md
![altテキスト](https://画像のURL)
*キャプション*
```
![alt text](https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43)
*キャプション*

## テーブル
```md
| Head | Head | Head |
| ---- | ---- | ---- |
| Text | Text | Text |
| Text | Text | Text |
```
| Head | Head | Head |
| ---- | ---- | ---- |
| Text | Text | Text |
| Text | Text | Text |

## コードブロック
```js:fooBar.js
const great = () => {
  console.log("Awesome");
};
```
## diffのシンタックスハイライト
```diff js:fooBar.js
@@ -4,6 +4,5 @@
+    const foo = bar.baz([1, 2, 3]) + 1;
-    let foo = bar.baz([1, 2, 3]);
```

## 数式
### ブロック
```
$$
e^{i\theta} = \cos\theta + i\sin\theta
$$
```
$$
e^{i\theta} = \cos\theta + i\sin\theta
$$

### インライン
`$a\ne0$`というように`$`ひとつで挟むことで、インラインで数式を含めることができます。たとえば$a\ne0$のようなイメージです。

## 引用
```md
> 引用文
> 引用文
```
> 引用文
> 引用文

## 注釈
```md
脚注の例[^1]です。インライン^[脚注の内容その2]で書くこともできます。

[^1]: 脚注の内容その1
```
脚注の例[^1]です。インライン^[脚注の内容その2]で書くこともできます。

[^1]: 脚注の内容その1

## 区切り線
```md
-----
```
-----

## インラインスタイル
```md
*イタリック*
**太字**
~~打ち消し線~~
インラインで`code`を挿入する
```
*イタリック*
**太字**
~~打ち消し線~~
インラインで`code`を挿入する

## インラインのコメント
```md
<!-- TODO: ◯◯について追記する -->
```
<!-- この文字は見えないはず -->

## Zenn 独自の記法

### メッセージ
```md
:::message
メッセージをここに
:::
```
:::message
メッセージをここに
:::

```md
:::message alert
警告メッセージをここに
:::
```
:::message alert
警告メッセージをここに
:::

### アコーディオン（トグル）
```md
:::details タイトル
表示したい内容
:::
```
:::details タイトル
表示したい内容
:::