document.documentElement.classList.add('js')

const revealElements = document.querySelectorAll('[data-reveal]')

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  )

  revealElements.forEach(element => observer.observe(element))
} else {
  revealElements.forEach(element => element.classList.add('is-visible'))
}
