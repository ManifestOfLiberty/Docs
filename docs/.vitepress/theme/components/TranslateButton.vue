<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface LanguageOption {
  code: string
  name: string
  flag: string
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: any
  }
}

const showDropdown = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const currentLang = ref('en')
const isReady = ref(false)
const searchQuery = ref('')
const dropdownStyle = ref<Record<string, string>>({})

const PROTECTED_TERMS = [
  'Manifest of Liberty',
  'SteamPipe', 'SteamClient', 'SteamCMD', 'SteamDB', 'SteamKit2', 'SteamKit',
  'Steam', 'Valve',
  'CDNClient', 'CDN', 'MRC', 'GID', 'CM',
  'depotfromapp', 'depotkeys', 'DepotID', 'AppID',
  'depot', 'Depot', 'manifest', 'Manifest',
  'chunk', 'Chunk',
  'protobuf', 'uint64', 'uint32', 'SHA-1', 'SHA', 'AES', 'LZMA', 'gzip',
  'VDF', 'VZ',
  'appinfo.vdf', 'packageinfo.vdf', 'sku.lua', 'key.vdf',
  'OpenSteamTool', 'ValvePython', 'cell_id',
  'UGC', 'DLC',
]

const languages: LanguageOption[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
]

const filteredLanguages = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return languages
  return languages.filter(lang => 
    lang.name.toLowerCase().includes(query) || 
    lang.code.toLowerCase().includes(query)
  )
})

function loadGoogleTranslate() {
  if (typeof window === 'undefined') return
  if (document.getElementById('google-translate-script')) {
    isReady.value = true
    return
  }

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.NONE,
        },
        'google_translate_element'
      )
      isReady.value = true
    }
  }

  const script = document.createElement('script')
  script.id = 'google-translate-script'
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.head.appendChild(script)
}

function getCombo(): HTMLSelectElement | null {
  return document.querySelector('.goog-te-combo')
}

function protectTerms() {
  if (typeof document === 'undefined') return

  const uiSelectors = [
    '.VPNav', '.VPNavBar', '.VPNavBarTitle', '.VPNavBarMenu',
    '.VPNavBarExtra', '.VPLocalNav',
    '.VPSidebar', '.VPSidebarItem',
    '.VPDocFooter', '.VPFooter',
    '.logo', '.site-title',
    'kbd', 'var',
  ].join(', ')

  document.querySelectorAll(uiSelectors).forEach(el => {
    el.setAttribute('translate', 'no')
    el.classList.add('notranslate')
  })

  document.querySelectorAll('code:not(pre code)').forEach(el => {
    el.setAttribute('translate', 'no')
    el.classList.add('notranslate')
  })

  document.querySelectorAll('pre').forEach(pre => {
    pre.setAttribute('translate', 'no')
    pre.classList.add('notranslate')

    pre.querySelectorAll('span').forEach(span => {
      const styleAttr = span.getAttribute('style') || ''
      const text = span.textContent || ''
      const isItalicToken = styleAttr.includes('font-style:italic') || styleAttr.includes('font-style: italic')
      const startsWithCommentMarker = /^\s*(#|\/\/|\/\*|--(?!>)|<!-)/.test(text)

      if (isItalicToken || startsWithCommentMarker) {
        span.setAttribute('translate', 'yes')
        span.classList.add('translate-comment')
        span.classList.remove('notranslate')
      }
    })
  })

  const sorted = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')
  const root = document.querySelector('.vp-doc') || document.body

  function hasNoTranslateAncestor(node: Node): boolean {
    let el = node.parentElement
    while (el && el !== root) {
      if (el.getAttribute('translate') === 'no') return true
      if (el.classList.contains('notranslate')) return true
      el = el.parentElement
    }
    return false
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName.toUpperCase()
      if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT
      if (hasNoTranslateAncestor(node)) return NodeFilter.FILTER_REJECT
      pattern.lastIndex = 0
      if (!pattern.test(node.textContent || '')) return NodeFilter.FILTER_SKIP
      pattern.lastIndex = 0
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const textNodes: Node[] = []
  let n: Node | null
  while ((n = walker.nextNode())) textNodes.push(n)

  textNodes.forEach(textNode => {
    const text = textNode.textContent || ''
    const frag = document.createDocumentFragment()
    let lastIndex = 0

    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
      }
      const span = document.createElement('span')
      span.setAttribute('translate', 'no')
      span.classList.add('notranslate')
      span.textContent = match[0]
      frag.appendChild(span)
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)))
    }

    if (lastIndex > 0 && textNode.parentNode) {
      textNode.parentNode.replaceChild(frag, textNode)
    }
  })
}

function translateTo(langCode: string) {
  currentLang.value = langCode
  showDropdown.value = false

  protectTerms()

  nextTick(() => {
    const combo = getCombo()
    if (!combo) return
    combo.value = langCode
    combo.dispatchEvent(new Event('change'))
  })
}

function resetTranslation() {
  currentLang.value = 'en'
  showDropdown.value = false

  const hostname = window.location.hostname
  const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'
  ;[
    `googtrans=; ${expiry}; path=/`,
    `googtrans=; ${expiry}; path=/; domain=${hostname}`,
    `googtrans=; ${expiry}; path=/; domain=.${hostname}`,
  ].forEach(c => { document.cookie = c })

  const combo = getCombo()
  if (combo) {
    combo.value = ''
    combo.dispatchEvent(new Event('change'))
  }

  window.location.reload()
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    searchQuery.value = ''
    nextTick(() => positionDropdown())
  }
}

function positionDropdown() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownH = 380

  if (spaceBelow < dropdownH) {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${Math.max(10, rect.top - dropdownH - 8)}px`,
      right: `${Math.max(10, window.innerWidth - rect.right)}px`,
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${Math.max(10, window.innerWidth - rect.right)}px`,
    }
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') showDropdown.value = false
}

onMounted(() => {
  loadGoogleTranslate()
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="translate-button-container" ref="containerRef">
    <button
      id="translate-toggle-btn"
      class="translate-button"
      :class="{ 'translate-button--active': showDropdown }"
      aria-label="Translate this page"
      title="Translate this page"
      @click="toggleDropdown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </button>

    <div id="google_translate_element" aria-hidden="true" style="position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;"></div>

    <Teleport to="body">
      <Transition name="translate-fade">
        <div
          v-if="showDropdown"
          class="translate-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Language selector"
          @click="showDropdown = false"
        >
          <div class="translate-dropdown notranslate" :style="dropdownStyle" translate="no" @click.stop>
            <div class="translate-dropdown__header">
              <span class="translate-dropdown__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Translate Page
              </span>
              <button class="translate-dropdown__close" aria-label="Close translation menu" @click="showDropdown = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="translate-search-box">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Filter languages..." 
              />
            </div>

            <div class="translate-dropdown__list">
              <button
                v-if="currentLang !== 'en'"
                class="translate-lang-item translate-lang-item--reset"
                @click="resetTranslation"
              >
                <span class="translate-lang-item__flag">↩</span>
                <span class="translate-lang-item__name">Show Original (English)</span>
              </button>

              <button
                v-for="lang in filteredLanguages"
                :key="lang.code"
                class="translate-lang-item"
                :class="{ 'translate-lang-item--active': currentLang === lang.code }"
                @click="translateTo(lang.code)"
              >
                <span class="translate-lang-item__flag">{{ lang.flag }}</span>
                <span class="translate-lang-item__name">{{ lang.name }}</span>
                <svg
                  v-if="currentLang === lang.code"
                  class="translate-lang-item__check"
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>

            <div class="translate-dropdown__footer">
              Powered by Google Translate
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.translate-button-container {
  position: relative;
  display: flex;
  align-items: center;
}

.translate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background-color: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.translate-button:hover,
.translate-button--active {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
</style>

<style>
.goog-te-banner-frame,
#goog-gt-tt,
.goog-te-balloon-frame,
.goog-tooltip,
.goog-tooltip-box,
.VIpgJd-ZVi9od-aZ2wEe,
.VIpgJd-yAWNEb-VIpgJd-fmcmS,
.skiptranslate:not(#google_translate_element) {
  display: none !important;
  visibility: hidden !important;
}

body {
  top: 0 !important;
}

body.translated-ltr,
body.translated-rtl {
  margin-top: 0 !important;
}

.translate-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}

.translate-dropdown {
  position: fixed;
  z-index: 10000;
  width: 240px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.translate-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.translate-dropdown__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.translate-dropdown__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 0;
}

.translate-dropdown__close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.translate-search-box {
  padding: 6px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.translate-search-box input {
  width: 100%;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  outline: none;
}

.translate-dropdown__list {
  overflow-y: auto;
  max-height: 260px;
  padding: 4px 0;
  scrollbar-width: thin;
}

.translate-lang-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.translate-lang-item:hover {
  background: var(--vp-c-bg-soft);
}

.translate-lang-item--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.translate-lang-item--reset {
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 4px;
  font-size: 0.8125rem;
}

.translate-lang-item__flag {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.translate-lang-item__name {
  flex: 1;
}

.translate-lang-item__check {
  flex-shrink: 0;
  color: var(--vp-c-brand-1);
  margin-left: auto;
}

.translate-dropdown__footer {
  padding: 6px 12px;
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

.translate-fade-enter-active,
.translate-fade-leave-active {
  transition: opacity 0.15s ease;
}

.translate-fade-enter-from,
.translate-fade-leave-to {
  opacity: 0;
}
</style>
