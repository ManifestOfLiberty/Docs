<template>
  <div class="custom-layout">
    <ReadingProgress />

    <DefaultTheme.Layout v-bind="$attrs">
      <template #doc-before>
        <slot name="doc-before" />
      </template>

      <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </DefaultTheme.Layout>

    <KeyboardShortcutsModal />
  </div>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './ReadingProgress.vue'
import KeyboardShortcutsModal from './KeyboardShortcutsModal.vue'
import { useData } from 'vitepress'
import { nextTick, useSlots, onMounted, onUnmounted } from 'vue'

const { isDark } = useData()
const slots = useSlots()

let observer: MutationObserver | null = null

const setupThemeTransition = () => {
  const appearanceBtn = document.querySelector('.VPNavBarAppearance') as HTMLElement | null
  if (!appearanceBtn) return false
  if ((appearanceBtn as any).__hasTransitionHandler) return true

  appearanceBtn.addEventListener('click', async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    if (
      typeof document.startViewTransition === 'function' &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    ) {
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ]

      const transition = document.startViewTransition(async () => {
        isDark.value = !isDark.value
        await nextTick()
      })

      await transition.ready

      document.documentElement.animate(
        { clipPath: isDark.value ? clipPath.reverse() : clipPath },
        {
          duration: 300,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
        }
      )
    } else {
      document.documentElement.classList.add('theme-transition-fallback')
      isDark.value = !isDark.value
      await nextTick()
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-fallback')
      }, 300)
    }
  }, true)

  ;(appearanceBtn as any).__hasTransitionHandler = true
  return true
}

onMounted(() => {
  if (typeof document === 'undefined') return
  document.documentElement.style.viewTransitionName = 'root'

  if (!setupThemeTransition()) {
    observer = new MutationObserver(() => {
      if (setupThemeTransition() && observer) {
        observer.disconnect()
        observer = null
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.custom-layout {
  position: relative;
}
</style>

<style>
@supports (view-transition-name: none) {
  :root {
    view-transition-name: root;
  }
  
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.3s;
    animation-timing-function: ease-in-out;
  }
  
  ::view-transition-group(root) {
    animation-duration: 0.3s;
    animation-timing-function: ease-in-out;
  }
}

html.theme-transition-fallback {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.theme-transition-fallback * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
