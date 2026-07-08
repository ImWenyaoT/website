export type DeepLearningFigureSize = 'full' | 'compact';

export type DeepLearningFigure = {
  name: string;
  title: string;
  size: DeepLearningFigureSize;
  importPath: string;
};

export const deepLearningFigures = [
  {
    name: 'TrainingLoopFigure',
    title: '深度学习训练主线',
    size: 'full',
    importPath: '@/components/deep-learning-figures/TrainingLoopFigure.astro',
  },
  {
    name: 'NeuronComputationFigure',
    title: '单个神经元的计算流程',
    size: 'full',
    importPath: '@/components/deep-learning-figures/NeuronComputationFigure.astro',
  },
  {
    name: 'MinimalMlpFigure',
    title: '两层 MLP 的结构',
    size: 'full',
    importPath: '@/components/deep-learning-figures/MinimalMlpFigure.astro',
  },
  {
    name: 'GradientDescentPathFigure',
    title: '梯度下降沿损失曲线移动',
    size: 'full',
    importPath: '@/components/deep-learning-figures/GradientDescentPathFigure.astro',
  },
  {
    name: 'LearningRateComparisonFigure',
    title: '不同学习率的更新路径',
    size: 'full',
    importPath: '@/components/deep-learning-figures/LearningRateComparisonFigure.astro',
  },
  {
    name: 'BackpropagationGraphFigure',
    title: '前向传播和反向传播计算图',
    size: 'full',
    importPath: '@/components/deep-learning-figures/BackpropagationGraphFigure.astro',
  },
  {
    name: 'NextTokenShiftFigure',
    title: '输入序列和目标序列错开一位',
    size: 'full',
    importPath: '@/components/deep-learning-figures/NextTokenShiftFigure.astro',
  },
  {
    name: 'TransformerPipelineFigure',
    title: 'GPT 风格 Transformer 流水线',
    size: 'full',
    importPath: '@/components/deep-learning-figures/TransformerPipelineFigure.astro',
  },
  {
    name: 'CausalMaskFigure',
    title: 'Causal mask 下三角矩阵',
    size: 'compact',
    importPath: '@/components/deep-learning-figures/CausalMaskFigure.astro',
  },
  {
    name: 'AttentionFlowFigure',
    title: 'Q K V 注意力流程',
    size: 'full',
    importPath: '@/components/deep-learning-figures/AttentionFlowFigure.astro',
  },
  {
    name: 'AttentionHeatmapFigure',
    title: '注意力权重热力图',
    size: 'compact',
    importPath: '@/components/deep-learning-figures/AttentionHeatmapFigure.astro',
  },
] as const satisfies DeepLearningFigure[];
