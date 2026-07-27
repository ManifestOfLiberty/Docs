<template>
  <div class="custom-layout">
    <ReadingProgress />

    <!-- Default Theme Layout -->
    <DefaultTheme.Layout v-bind="$attrs">
      <template #doc-before>
        <slot name="doc-before" />
      </template>

      <!-- Pass through all other slots -->
      <template v-for="(_, name) in slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </DefaultTheme.Layout>
  </div>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './ReadingProgress.vue'
import { useData } from 'vitepress'
import { nextTick, useSlots, onMounted } from 'vue'

const { isDark } = useData()
const slots = useSlots()


// Set view-transition-name on root element
onMounted(() => {
  if (typeof document === 'undefined') return
  
  // Set view-transition-name on root for view transitions
  document.documentElement.style.viewTransitionName = 'root'
  
  // Hook into VitePress appearance toggle
  const setupAppearanceToggle = () => {
    const appearanceButton = document.querySelector('.VPNavBarAppearance') as HTMLElement
    if (!appearanceButton) return false

    // Check if already has our custom handler
    if ((appearanceButton as any).__hasTransitionHandler) return true
    
    // Add click listener with view transition
    appearanceButton.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Get click position for circular reveal
      const x = e.clientX
      const y = e.clientY
      
      // Check if view transitions are supported
      if (typeof document.startViewTransition === 'function' && 
          window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        
        // Calculate clip path for circular reveal
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )
        
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
        
        // Start view transition
        const transition = document.startViewTransition(async () => {
          // Toggle theme
          isDark.value = !isDark.value
          await nextTick()
        })
        
        // Wait for transition to be ready
        await transition.ready
        
        // Animate the clip path
        document.documentElement.animate(
          { clipPath: isDark.value ? clipPath.reverse() : clipPath },
          {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards',
            pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
          }
        )
      } else {
        // Fallback for browsers without view transitions
        document.documentElement.classList.add('theme-transition-fallback')
        isDark.value = !isDark.value
        await nextTick()
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition-fallback')
        }, 300)
      }
    }, true) // Use capture phase

    // Mark as setup
    ;(appearanceButton as any).__hasTransitionHandler = true
    return true
  }

  // Try to setup immediately
  if (!setupAppearanceToggle()) {
    // If not found, watch for it to appear
    const observer = new MutationObserver(() => {
      if (setupAppearanceToggle() && observer) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Also try after delays
    setTimeout(() => setupAppearanceToggle(), 100)
    setTimeout(() => setupAppearanceToggle(), 500)
    setTimeout(() => {
      if (observer) observer.disconnect()
    }, 2000)
  }
})
</script>

<style scoped>
.custom-layout {
  position: relative;
}

/* Fallback transition for non-supporting browsers */
html.theme-transition-fallback {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.theme-transition-fallback * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>

<style>
/* View Transition API styles for theme switching */
@supports (view-transition-name: none) {
  /* Set view-transition-name on root */
  :root {
    view-transition-name: root;
  }
  
  /* View transition animations */
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

/* Fallback transition for non-supporting browsers */
html.theme-transition-fallback {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.theme-transition-fallback * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
