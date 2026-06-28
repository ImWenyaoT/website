/**
 * Makes the header title behave like a home link.
 */
document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('.md-header__title')
  const logo = document.querySelector('.md-header__button.md-logo')

  if (!(title instanceof HTMLElement) || !(logo instanceof HTMLAnchorElement)) {
    return
  }

  const href = logo.getAttribute('href')

  if (!href) {
    return
  }

  title.setAttribute('role', 'link')
  title.setAttribute('tabindex', '0')
  title.setAttribute('aria-label', '返回首页')

  title.addEventListener('click', () => {
    window.location.href = href
  })

  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      window.location.href = href
    }
  })
})
