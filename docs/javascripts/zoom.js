/* 点击图示/图片 → 全屏放大浮层；点击任意处或按 Esc 关闭。
 *
 * 为什么自己写：本站的「图」全是内联 SVG（.dl-figure 手绘图、mermaid），
 * 官方 GLightbox 只认 <img>，用不了。这里用事件委托到 document，
 * 天然兼容 Material 的 instant 导航（无需按页重新绑定），覆盖 SVG 图与任意 <img>。 */
(function () {
  var SELECTOR = ".md-typeset .dl-figure, .md-typeset .mermaid, .md-typeset img";

  /* 打开放大浮层：克隆被点元素，铺进一个全屏 backdrop。 */
  function openZoom(el) {
    var overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    var content = el.cloneNode(true);
    content.classList.add("zoom-content");
    content.removeAttribute("style"); // 去掉可能的行内尺寸限制
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden"; // 放大时锁背景滚动
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });

    function close() {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      overlay.classList.remove("is-open");
      overlay.addEventListener(
        "transitionend",
        function () {
          overlay.remove();
        },
        { once: true }
      );
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }

    overlay.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  }

  /* 事件委托：点到目标元素（且不是点在其内部链接上）才放大。 */
  document.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var el = e.target.closest(SELECTOR);
    if (!el) return;
    e.preventDefault();
    openZoom(el);
  });
})();
