---
title: "梯度下降法"
description: "把训练看成在损失曲面上沿梯度反方向调整参数，并解释学习率与小批量的作用。"
tags:
  - "The Model"
  - "Patterns of Work"
---
# 梯度下降法

[training](https://www.aihero.dev/ai-coding-dictionary/training) 神经网络时，我们先定义一个损失函数。损失越小，[model](https://www.aihero.dev/ai-coding-dictionary/model) 越接近目标。梯度下降的想法很直接：梯度指向损失上升最快的方向，所以参数更新时往梯度的反方向走。

```text
新参数 = 旧参数 - 学习率 * 梯度
```

学习率决定每一步走多远。太小会慢，太大会跳过低点甚至震荡。

## 动机

神经网络有大量参数。我们不可能手工指定每个权重应该是多少，只能定义一个目标：让预测和真实答案之间的损失尽可能小。

梯度下降把学习问题改写成优化问题：

```text
找到一组参数，使 loss(parameters) 尽量小
```

这里的关键不是“[model](https://www.aihero.dev/ai-coding-dictionary/model) 像人一样理解了数据”，而是“参数被不断调整，使 [training](https://www.aihero.dev/ai-coding-dictionary/training) 目标下降”。

```mermaid
flowchart LR
  P0["当前参数"] --> Pred["产生预测"]
  Pred --> Loss["计算损失"]
  Loss --> Grad["估计坡度"]
  Grad --> P1["参数走一步"]
  P1 --> Pred
```

## 损失曲线上的下降路径

<svg class="dl-figure" viewBox="0 0 920 360" role="img" aria-labelledby="gd-title">
  <title id="gd-title">梯度下降沿损失曲线移动</title>
  <defs>
    <marker id="arrow-gd" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#2f5f9f"></path>
    </marker>
  </defs>
  <line x1="90" y1="290" x2="820" y2="290" class="dl-axis"></line>
  <line x1="90" y1="290" x2="90" y2="45" class="dl-axis"></line>
  <text x="835" y="295" class="dl-small">w</text>
  <text x="70" y="45" class="dl-small">loss</text>
  <path
    d="M125 80 C220 170, 280 245, 420 266 C570 288, 640 190, 770 70"
    fill="none"
    class="dl-curve"></path>
  <circle cx="735" cy="92" r="8" class="dl-point-warn"></circle>
  <circle cx="650" cy="174" r="8" class="dl-point"></circle>
  <circle cx="560" cy="234" r="8" class="dl-point"></circle>
  <circle cx="455" cy="263" r="8" class="dl-point"></circle>
  <line x1="728" y1="98" x2="665" y2="164" class="dl-arrow" marker-end="url(#arrow-gd)"></line>
  <line x1="642" y1="181" x2="575" y2="228" class="dl-arrow" marker-end="url(#arrow-gd)"></line>
  <line x1="550" y1="238" x2="470" y2="260" class="dl-arrow" marker-end="url(#arrow-gd)"></line>
  <text x="565" y="318" text-anchor="middle" class="dl-small">每一步都用当前梯度决定方向</text>
</svg>

## 用一个权重拟合直线

下面的例子只有一个参数 `w`，目标是学到 `y = 2x`。

```python
def gradient_descent_step(w, x, y, lr):
    """用 PyTorch-like 写法表达一次梯度下降更新。"""
    prediction = w * x
    loss = mean((prediction - y) ** 2)

    grad_w = grad(loss, w)
    w_next = w - lr * grad_w

    return w_next, loss
```

这段代码里，`loss.backward()` 负责计算 `w.grad`。更新参数时使用 `torch.no_grad()`，因为“修改参数”本身不应该被记录进计算图。

## 学习率对比

<svg class="dl-figure" viewBox="0 0 920 310" role="img" aria-labelledby="lr-title">
  <title id="lr-title">不同学习率的更新路径</title>
  <line x1="70" y1="250" x2="850" y2="250" class="dl-axis"></line>
  <line x1="70" y1="250" x2="70" y2="50" class="dl-axis"></line>
  <path
    d="M90 70 C220 210, 310 246, 460 250 C630 252, 710 190, 830 72"
    fill="none"
    class="dl-curve-muted"></path>
  <polyline
    points="760,92 720,125 680,155 640,180 600,202 560,220 520,234"
    fill="none"
    class="dl-line-blue"></polyline>
  <polyline points="760,92 610,198 500,238 448,248" fill="none" class="dl-line-green"></polyline>
  <polyline points="760,92 390,246 690,150 420,248" fill="none" class="dl-line-orange"></polyline>
  <text x="540" y="110" class="dl-small dl-blue">太小：慢</text>
  <text x="485" y="205" class="dl-small dl-green">合适：稳定下降</text>
  <text x="690" y="210" class="dl-small dl-orange">太大：震荡</text>
</svg>

## 关键操作

| 代码                   | 作用                             |
| ---------------------- | -------------------------------- |
| `requires_grad=True`   | 告诉 PyTorch 这个张量需要梯度。  |
| `loss.backward()`      | 从损失开始反向计算梯度。         |
| `with torch.no_grad()` | 更新参数时不要记录计算图。       |
| `w.grad.zero_()`       | 清空梯度，避免下一轮累加旧梯度。 |

## 直观理解

### 学习率像步长

学习率不是越大越好。它控制的是“相信当前梯度到什么程度”。梯度只描述当前位置附近的坡度，如果一步走太远，新的位置可能已经不适用原来的局部信息。

```mermaid
flowchart TD
  LR["学习率"] --> Small["太小: 走得稳但慢"]
  LR --> Good["合适: 稳定下降"]
  LR --> Large["太大: 来回震荡"]
```

### 批量、随机和小批量

| 方法                        | 每次用多少数据算梯度                                                     | 特点               |
| --------------------------- | ------------------------------------------------------------------------ | ------------------ |
| Batch gradient descent      | 全部 [training](https://www.aihero.dev/ai-coding-dictionary/training) 集 | 稳定但贵。         |
| Stochastic gradient descent | 一个样本                                                                 | 便宜但噪声大。     |
| Mini-batch gradient descent | 一小批样本                                                               | 深度学习里最常见。 |

小批量方法不是数学上最干净的版本，但工程上最实用：它既能利用矩阵计算，又能引入适度噪声，帮助 [training](https://www.aihero.dev/ai-coding-dictionary/training) 从某些糟糕区域走出来。

## 限制

- 梯度下降依赖学习率，学习率不合适会慢或不稳定。
- 非凸损失没有全局最优保证。
- 梯度只看局部方向，不理解任务语义。
- 深层网络还会遇到梯度消失、梯度爆炸和病态曲率。

## 阅读更多

下一章读 [反向传播算法](backpropagation.md)：梯度下降假设我们已经拿到梯度，而反向传播解释这些梯度如何被高效算出来。

## 小结

梯度下降是“怎么用梯度更新参数”，不是“怎么计算梯度”。计算梯度由下一章的反向传播完成。
