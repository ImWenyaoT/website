/**
 * 轻量 PDF.js 论文阅读器
 *
 * 把页面里的 <div class="pdf-viewer" data-pdf data-arxiv data-title></div>
 * 渲染成可滚动、可缩放、可下载的论文阅读器。设计取向：
 *   - 贴合站点 9 色 + 透明度的极简风格（样式见 notes/assets/styles.css）
 *   - 默认按容器宽度自适应，移动端可读
 *   - 长论文按需懒渲染，避免一次性渲染所有页
 *   - 仅在存在 .pdf-viewer 的页面才动态加载 pdf.js，普通页面零成本
 */

const PDFJS_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build'
const ZOOM_STEP = 0.2
const ZOOM_MIN = 0.6
const ZOOM_MAX = 2.4

/** 入口：发现 .pdf-viewer 才动态加载 pdf.js，再逐个初始化。 */
async function bootstrap() {
  const roots = document.querySelectorAll('.pdf-viewer:not([data-ready])')
  if (!roots.length) return

  const pdfjsLib = await import(`${PDFJS_BASE}/pdf.min.mjs`)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`

  for (const root of roots) {
    root.dataset.ready = '1'
    initViewer(pdfjsLib, root).catch(err => renderError(root, err))
  }
}

/** 构建单个阅读器：工具栏 + 滚动页面区 + 懒渲染 + 缩放联动。 */
async function initViewer(pdfjsLib, root) {
  const url = root.dataset.pdf
  if (!url) return

  // --- 工具栏 ---
  const toolbar = document.createElement('div')
  toolbar.className = 'pdf-viewer__toolbar'

  const title = document.createElement(root.dataset.arxiv ? 'a' : 'span')
  title.className = 'pdf-viewer__title'
  title.textContent = root.dataset.title || '原文 PDF'
  if (root.dataset.arxiv) {
    title.href = root.dataset.arxiv
    title.target = '_blank'
    title.rel = 'noopener'
  }

  const pageLabel = document.createElement('span')
  pageLabel.className = 'pdf-viewer__page-label'

  const zoomOut = makeButton('−', '缩小')
  const zoomLabel = document.createElement('span')
  zoomLabel.className = 'pdf-viewer__zoom-label'
  const zoomIn = makeButton('+', '放大')

  const download = document.createElement('a')
  download.className = 'pdf-viewer__btn'
  download.textContent = '下载'
  download.href = url
  download.setAttribute('download', '')

  toolbar.append(title, spacer(), pageLabel, zoomOut, zoomLabel, zoomIn, download)

  // --- 滚动页面区 ---
  const pagesEl = document.createElement('div')
  pagesEl.className = 'pdf-viewer__pages'

  root.append(toolbar, pagesEl)

  // --- 加载文档 ---
  const pdf = await pdfjsLib.getDocument(url).promise
  const total = pdf.numPages
  const firstPage = await pdf.getPage(1)
  const baseWidth = firstPage.getViewport({ scale: 1 }).width
  const aspect = firstPage.getViewport({ scale: 1 }).height / baseWidth

  // 基准缩放：让单页按页面区可用宽度铺满；zoom 在此之上做倍率
  const available = () => Math.max(200, (pagesEl.clientWidth || 700) - 28)
  const fitScale = () => available() / baseWidth
  let zoom = 1

  // 每页一个占位 canvas，记录渲染状态与进行中的渲染任务
  const slots = []
  for (let n = 1; n <= total; n++) {
    const canvas = document.createElement('canvas')
    canvas.className = 'pdf-viewer__page'
    canvas.dataset.page = String(n)
    pagesEl.appendChild(canvas)
    slots.push({ n, canvas, rendered: false, task: null })
  }

  /** 渲染单页到其 canvas（按 devicePixelRatio 提升清晰度）。 */
  async function renderSlot(slot) {
    if (slot.rendered) return
    slot.rendered = true
    const page = await pdf.getPage(slot.n)
    const scale = fitScale() * zoom
    const dpr = window.devicePixelRatio || 1
    const viewport = page.getViewport({ scale })
    const ctx = slot.canvas.getContext('2d')
    slot.canvas.width = Math.floor(viewport.width * dpr)
    slot.canvas.height = Math.floor(viewport.height * dpr)
    slot.canvas.style.width = `${Math.floor(viewport.width)}px`
    slot.canvas.style.height = `${Math.floor(viewport.height)}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    slot.task = page.render({ canvasContext: ctx, viewport })
    await slot.task.promise
    slot.task = null
  }

  /** 渲染前先给未渲染的 canvas 占位，避免布局塌陷与滚动跳动。 */
  function reserveSizes() {
    const w = Math.floor(fitScale() * zoom * baseWidth)
    for (const slot of slots) {
      if (slot.rendered) continue
      slot.canvas.style.width = `${w}px`
      slot.canvas.style.height = `${Math.floor(w * aspect)}px`
    }
  }

  // 懒渲染：以页面区为视口，进入附近就渲染
  const renderIo = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const slot = slots[Number(entry.target.dataset.page) - 1]
        renderSlot(slot).catch(() => { slot.rendered = false })
        renderIo.unobserve(entry.target)
      }
    },
    { root: pagesEl, rootMargin: '400px 0px', threshold: 0.01 },
  )

  // 当前页指示：取最靠近页面区中线的页
  const pageIo = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          pageLabel.textContent = `${entry.target.dataset.page} / ${total}`
        }
      }
    },
    { root: pagesEl, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )

  /** 缩放变更：取消在途渲染、重置状态、重新占位并触发可见页重渲染。 */
  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`
    for (const slot of slots) {
      if (slot.task) { try { slot.task.cancel() } catch (_) {} }
      slot.rendered = false
      slot.task = null
    }
    reserveSizes()
    for (const slot of slots) renderIo.observe(slot.canvas)
  }

  zoomOut.addEventListener('click', () => setZoom(zoom - ZOOM_STEP))
  zoomIn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP))

  // 窗口尺寸变化时按新宽度重新适配（防抖）
  let resizeTimer = null
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => setZoom(zoom), 200)
  })

  zoomLabel.textContent = '100%'
  pageLabel.textContent = `1 / ${total}`
  reserveSizes()
  for (const slot of slots) {
    renderIo.observe(slot.canvas)
    pageIo.observe(slot.canvas)
  }
}

/** 生成工具栏图标按钮。 */
function makeButton(label, aria) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'pdf-viewer__btn pdf-viewer__btn--icon'
  btn.textContent = label
  btn.setAttribute('aria-label', aria)
  btn.title = aria
  return btn
}

/** 工具栏弹性占位，把右侧控件推到末端。 */
function spacer() {
  const el = document.createElement('span')
  el.className = 'pdf-viewer__spacer'
  return el
}

/** 加载失败兜底：提示并给出 arXiv 链接（用 DOM 方法构造，避免 innerHTML）。 */
function renderError(root, err) {
  console.error('[pdf-viewer]', err)
  const msg = document.createElement('div')
  msg.className = 'pdf-viewer__error'
  msg.append('PDF 加载失败。')
  if (root.dataset.arxiv) {
    msg.append('可前往 ')
    const link = document.createElement('a')
    link.href = root.dataset.arxiv
    link.target = '_blank'
    link.rel = 'noopener'
    link.textContent = 'arXiv'
    msg.append(link, ' 阅读。')
  }
  root.appendChild(msg)
}

bootstrap()
