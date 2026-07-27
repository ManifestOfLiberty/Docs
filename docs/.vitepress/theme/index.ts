import { h, onMounted, onUnmounted, watch, nextTick, toRefs } from 'vue'
import { useData, useRoute } from 'vitepress'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

// ---- Styles ----
import './style/style.css'
import 'viewerjs/dist/viewer.min.css'
import "vue-toastification/dist/index.css"
import "vitepress-markdown-timeline/dist/theme/index.css"
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'
import '@nolebase/vitepress-plugin-page-properties/client/style.css'
import '@nolebase/vitepress-plugin-highlight-targeted-heading/client/style.css'
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

// ---- Plugins ----
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import vitepressBackToTop from 'vitepress-plugin-back-to-top'
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import { NolebasePagePropertiesPlugin } from '@nolebase/vitepress-plugin-page-properties/client'
import { NolebaseHighlightTargetedHeading } from '@nolebase/vitepress-plugin-highlight-targeted-heading/client'
import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client'
import { NolebaseEnhancedReadabilitiesMenu, NolebaseEnhancedReadabilitiesScreenMenu, InjectionKey, type Options } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

// ---- Components ----
import xgplayer from "./components/xgplayer.vue"
import LegalCallout from './components/LegalCallout.vue'
import TableWrap from './components/TableWrap.vue'
import ReportButton from './components/ReportButton.vue'
import TagsChips from './components/TagsChips.vue'
import RelatedLinks from './components/RelatedLinks.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import CustomLayout from './components/CustomLayout.vue'

// ---- Toast ----
import Toast, { PluginOptions } from "vue-toastification"

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    app.component('xgplayer', xgplayer)
    app.component('LegalCallout', LegalCallout)
    app.component('TableWrap', TableWrap)
    app.component('ReportButton', ReportButton)
    app.component('TagsChips', TagsChips)
    app.component('RelatedLinks', RelatedLinks)
    app.component('ReadingProgress', ReadingProgress)
    app.component('CustomLayout', CustomLayout)
    app.component('vImageViewer', vImageViewer)

    app.provide(InjectionKey, {
      defaultMode: 'LayoutMode.Original',
      disableAnimation: false,
    } as Options)

    // Toast options
    const options: PluginOptions = {
      transition: "Vue-Toastification__slideBlurred",
      maxToasts: 30,
      newestOnTop: true,
    };

    // Plugins setup
    app.use(Toast, options)
    app.use(NolebaseInlineLinkPreviewPlugin)
    app.use(NolebaseGitChangelogPlugin, {})
    app.use(autoAnimatePlugin)

    // Back to top plugin
    vitepressBackToTop({
      threshold: 300
    })
  },

  setup() {
    const route = useRoute()
    const { frontmatter } = toRefs(useData())

    imageViewer(route)

    // Reading time, fade-in animations, etc.
    onMounted(() => {
      let observer: IntersectionObserver | null = null
      if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in')
              observer?.unobserve(entry.target)
            }
          })
        }, { threshold: 0.1, rootMargin: '50px' })

        document.querySelectorAll('.vp-doc img, .vp-doc pre').forEach(el => observer?.observe(el))
        
        watch(route, () => {
          if (observer) {
            observer.disconnect()
            observer = null
            nextTick(() => {
              if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
                observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('animate-fade-in')
                      observer?.unobserve(entry.target)
                    }
                  })
                }, { threshold: 0.1, rootMargin: '50px' })
                document.querySelectorAll('.vp-doc img, .vp-doc pre').forEach(el => observer?.observe(el))
              }
            })
          }
        })
      }

      onUnmounted(() => {
        if (observer) {
          observer.disconnect()
          observer = null
        }
      })
    })
  },

  Layout: () => {
    const props: Record<string, any> = {}
    const { frontmatter } = useData()

    if (frontmatter.value?.layoutClass) props.class = frontmatter.value.layoutClass

    return h(CustomLayout, props, {
      'nav-bar-content-after': () => [
        h(NolebaseEnhancedReadabilitiesMenu),
        h('div', { class: 'nav-actions-wrapper flex items-center gap-2' }, [
          h(ReportButton)
        ])
      ],
      'nav-screen-content-after': () => [
        h(NolebaseEnhancedReadabilitiesScreenMenu),
        h('div', { class: 'flex flex-col gap-2' }, [
          h(ReportButton)
        ])
      ],
      'layout-top': () => [
        h(NolebaseHighlightTargetedHeading)
      ],
      'doc-before': () => []
    })
  }
} satisfies Theme