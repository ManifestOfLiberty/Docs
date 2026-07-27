<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const showDropdown = ref(false)
const containerRef = ref(null)
const currentLang = ref('en')
const isReady = ref(false)
const dropdownStyle = ref({})

// ── Technical terms that must NEVER be translated ─────────────────────────────
// Sorted longest-first so the regex prioritises longer compound matches.
// Add any new term here to protect it site-wide.
const PROTECTED_TERMS = [
  // Site identity — never translate the name of the project
  'Manifest of Liberty',
  // Steam infrastructure
  'SteamPipe', 'SteamClient', 'SteamCMD', 'SteamDB', 'SteamKit2', 'SteamKit',
  'Steam', 'Valve',
  // CDN / networking
  'CDNClient', 'CDN', 'MRC', 'GID', 'CM',
  // Compound technical identifiers (order matters — longer first)
  'depotfromapp', 'depotkeys', 'DepotID', 'AppID',
  'depot', 'Depot', 'manifest', 'Manifest',
  'chunk', 'Chunk',
  // Data formats & encodings
  'protobuf', 'uint64', 'uint32', 'SHA-1', 'SHA', 'AES', 'LZMA', 'gzip',
  'VDF', 'VZ',
  // File / config names
  'appinfo.vdf', 'packageinfo.vdf', 'sku.lua', 'key.vdf',
  // API / class names
  'OpenSteamTool', 'ValvePython', 'cell_id',
  // Feature keywords
  'UGC', 'DLC',
]

const languages = [
  { code: 'es', name: 'Spanish',                flag: '🇪🇸' },
  { code: 'fr', name: 'French',                 flag: '🇫🇷' },
  { code: 'de', name: 'German',                 flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese',             flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',                flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Simplified)',flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese',               flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',                 flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic',                 flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi',                  flag: '🇮🇳' },
  { code: 'it', name: 'Italian',                flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch',                  flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish',                flag: '🇹🇷' },
  { code: 'pl', name: 'Polish',                 flag: '🇵🇱' },
  { code: 'hu', name: 'Hungarian',              flag: '🇭🇺' },
  { code: 'sv', name: 'Swedish',                flag: '🇸🇪' },
  { code: 'uk', name: 'Ukrainian',              flag: '🇺🇦' },
]

// ── Google Translate initializer ──────────────────────────────────────────────

function loadGoogleTranslate() {
  if (typeof window === 'undefined') return

  window.googleTranslateElementInit = () => {
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

  const script = document.createElement('script')
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.head.appendChild(script)
}

// ── Translate / reset ─────────────────────────────────────────────────────────

function getCombo() {
  return document.querySelector('.goog-te-combo')
}

/**
 * Protect all technical content before Google Translate scans the DOM.
 *
 * Pass 1a — site UI (nav, sidebar, footer, logo):
 *   These regions stay in English always.
 *
 * Pass 1b — inline code (<code> not inside <pre>):
 *   Fully untranslatable.
 *
 * Pass 1c — code BLOCKS (<pre>):
 *   The whole block is marked translate="no", BUT comment spans inside are
 *   re-opened with translate="yes" so only the comments get translated.
 *   Comments are detected by Shiki's font-style:italic styling and/or text
 *   starting with common comment markers (# // /* -- <!--).
 *
 * Pass 2 — inline prose keywords:
 *   Uses \b word boundaries so "depot" inside "depotkeys" is NOT split.
 */
function protectTerms() {
  if (typeof document === 'undefined') return

  // ── Pass 1a: site chrome ──────────────────────────────────────────────────
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

  // ── Pass 1b: inline code (not inside a block) ─────────────────────────────
  document.querySelectorAll('code:not(pre code)').forEach(el => {
    el.setAttribute('translate', 'no')
    el.classList.add('notranslate')
  })

  // ── Pass 1c: code BLOCKS — protect everything, re-enable comments ─────────
  document.querySelectorAll('pre').forEach(pre => {
    // Mark the entire block untranslatable first
    pre.setAttribute('translate', 'no')
    pre.classList.add('notranslate')

    // Now scan every span inside the block for comment tokens.
    // Shiki (the syntax highlighter VitePress uses) marks comment tokens with
    // font-style:italic in most dark themes including one-dark-pro.
    // We also catch un-styled comments by looking at the text prefix.
    pre.querySelectorAll('span').forEach(span => {
      const styleAttr = span.getAttribute('style') || ''
      const text = span.textContent

      const isItalicToken = styleAttr.includes('font-style:italic') ||
                            styleAttr.includes('font-style: italic')

      // Match the comment opener at the start of trimmed text:
      //   #  → Python / Ruby / Shell / YAML / TOML
      //   // → JS / TS / C / C++ / Rust / Go / Java
      //   /* → C / CSS block comment opener
      //   -- → SQL / Lua
      //   <!-- → HTML / XML
      const startsWithCommentMarker = /^\s*(#|\/\/|\/\*|--(?!>)|<!-)/.test(text)

      if (isItalicToken || startsWithCommentMarker) {
        // translate="yes" overrides the parent pre's translate="no"
        span.setAttribute('translate', 'yes')
        span.classList.add('translate-comment')
        span.classList.remove('notranslate')
      }
    })
  })

  // ── Pass 2: inline prose keywords in the doc body ─────────────────────────

  const sorted = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')

  const root = document.querySelector('.vp-doc') || document.body

  // Helper: walk up the ancestor chain to check for a no-translate ancestor.
  // (The simple parent-only check was missing grandparent <pre> containers.)
  function hasNoTranslateAncestor(node) {
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
      if (!pattern.test(node.textContent)) return NodeFilter.FILTER_SKIP
      pattern.lastIndex = 0
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const textNodes = []
  let n
  while ((n = walker.nextNode())) textNodes.push(n)

  textNodes.forEach(textNode => {
    const text = textNode.textContent
    const frag = document.createDocumentFragment()
    let lastIndex = 0

    pattern.lastIndex = 0
    let match
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

    if (lastIndex > 0) {
      textNode.parentNode.replaceChild(frag, textNode)
    }
  })
}


function translateTo(langCode) {
  currentLang.value = langCode
  showDropdown.value = false

  // Protect domain keywords BEFORE Google Translate scans the DOM
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

  // Google Translate stores the chosen language in a "googtrans" cookie.
  // If we don't delete it before reloading, the widget just re-applies the
  // same translation on the next page load — which is the bug.
  // We clear it across all the path/domain variants Google might have used.
  const hostname = window.location.hostname
  const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 UTC'
  ;[
    `googtrans=; ${expiry}; path=/`,
    `googtrans=; ${expiry}; path=/; domain=${hostname}`,
    `googtrans=; ${expiry}; path=/; domain=.${hostname}`,
  ].forEach(c => { document.cookie = c })

  // Also try the in-page combo reset in case the widget handles it gracefully
  const combo = document.querySelector('.goog-te-combo')
  if (combo) {
    combo.value = ''
    combo.dispatchEvent(new Event('change'))
  }

  // Hard reload so the page starts fresh with no translation
  window.location.reload()
}


// ── Dropdown positioning ──────────────────────────────────────────────────────

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    nextTick(() => positionDropdown())
  }
}

function positionDropdown() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownH = 400

  if (spaceBelow < dropdownH) {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.top - dropdownH - 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  }
}

// ── Outside click / keyboard dismiss ─────────────────────────────────────────

function onKeyDown(e) {
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
    <!-- Navbar globe button -->
    <button
      id="translate-toggle-btn"
      class="translate-button"
      :class="{ 'translate-button--active': showDropdown }"
      @click="toggleDropdown"
      aria-label="Translate this page"
      title="Translate this page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </button>

    <!-- Hidden Google Translate widget mount point -->
    <div id="google_translate_element" aria-hidden="true" style="position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;"></div>

    <!-- Language picker dropdown (teleported to body for correct z-index) -->
    <Teleport to="body">
      <Transition name="translate-fade">
        <div
          v-if="showDropdown"
          class="translate-overlay"
          @click.self="showDropdown = false"
          role="dialog"
          aria-modal="true"
          aria-label="Language selector"
        >
          <div class="translate-dropdown notranslate" :style="dropdownStyle" translate="no">
            <!-- Header -->
            <div class="translate-dropdown__header">
              <span class="translate-dropdown__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Translate Page
              </span>
              <button class="translate-dropdown__close" @click="showDropdown = false" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Language list -->
            <div class="translate-dropdown__list">
              <!-- "Show original" row — only visible when translated -->
              <button
                v-if="currentLang !== 'en'"
                class="translate-lang-item translate-lang-item--reset"
                @click="resetTranslation"
              >
                <span class="translate-lang-item__flag">↩</span>
                <span class="translate-lang-item__name">Show Original (English)</span>
              </button>

              <button
                v-for="lang in languages"
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
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>

            <!-- Footer -->
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
/* ── Navbar button ─────────────────────────────────────────────────────── */

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

<!-- Global styles (unscoped) — hide Google's injected UI chrome ───────────── -->
<style>
/* Kill the Google Translate banner bar that tries to appear at the top */
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

/* Google inserts top padding to make room for its bar — kill it */
body {
  top: 0 !important;
}

body.translated-ltr,
body.translated-rtl {
  margin-top: 0 !important;
}

/* ── Dropdown overlay ───────────────────────────────────────────────────── */

.translate-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  /* semi-transparent backdrop — subtle */
  background: transparent;
}

/* ── Dropdown card ──────────────────────────────────────────────────────── */

.translate-dropdown {
  position: fixed;
  z-index: 10000;
  width: 220px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.14);
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
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.translate-dropdown__close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* ── Language list ──────────────────────────────────────────────────────── */

.translate-dropdown__list {
  overflow-y: auto;
  max-height: 320px;
  padding: 4px 0;

  /* custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-divider) transparent;
}

.translate-dropdown__list::-webkit-scrollbar {
  width: 4px;
}
.translate-dropdown__list::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
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
  line-height: 1;
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

/* ── Footer ─────────────────────────────────────────────────────────────── */

.translate-dropdown__footer {
  padding: 6px 12px;
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

/* ── Transition ──────────────────────────────────────────────────────────── */

.translate-fade-enter-active,
.translate-fade-leave-active {
  transition: opacity 0.15s ease;
}

.translate-fade-enter-from,
.translate-fade-leave-to {
  opacity: 0;
}

.translate-fade-enter-active .translate-dropdown,
.translate-fade-leave-active .translate-dropdown {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.translate-fade-enter-from .translate-dropdown,
.translate-fade-leave-to .translate-dropdown {
  transform: translateY(-6px);
  opacity: 0;
}
</style>
