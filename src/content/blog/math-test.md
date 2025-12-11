---
title: '数式とコードブロックのテスト'
description: 'KaTeXによる数式レンダリングとShikiによるコードハイライトのテスト記事'
pubDate: 'Dec 11 2024'
---

この記事では、数式とコードブロックの表示をテストします。

## インライン数式

アインシュタインの有名な質量とエネルギーの等価式は $E=mc^2$ です。ここで $E$ はエネルギー、$m$ は質量、$c$ は光速を表します。

二次方程式 $ax^2 + bx + c = 0$ の解は $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ で与えられます。

## ブロック数式

以下はオイラーの等式です：

$$
e^{i\pi} + 1 = 0
$$

ガウス積分：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

行列の例：

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

## Pythonコードブロック

フィボナッチ数列を計算するPythonコード：

```python
def fibonacci(n: int) -> list[int]:
    """フィボナッチ数列の最初のn項を返す"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    sequence = [0, 1]
    for _ in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# 最初の10項を出力
result = fibonacci(10)
print(f"フィボナッチ数列（最初の10項）: {result}")
# 出力: フィボナッチ数列（最初の10項）: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

NumPyを使った行列演算：

```python
import numpy as np

# 行列の定義
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 行列積
C = np.dot(A, B)
print("行列積 A @ B =")
print(C)

# 固有値と固有ベクトル
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"\n固有値: {eigenvalues}")
print(f"固有ベクトル:\n{eigenvectors}")
```

## まとめ

この記事では、以下の機能が正しく動作することを確認しました：

1. **インライン数式**: `$...$` で囲んだ数式
2. **ブロック数式**: `$$...$$` で囲んだ数式
3. **コードハイライト**: Draculaテーマによるシンタックスハイライト
4. **行の折り返し**: 長いコード行の自動折り返し
