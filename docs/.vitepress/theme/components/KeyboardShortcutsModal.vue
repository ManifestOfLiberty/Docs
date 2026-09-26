<template>
  <Teleport to="body">
    <Transition name="shortcut-fade">
      <div v-if="isOpen" class="shortcut-backdrop" @click.self="isOpen = false" role="dialog" aria-modal="true">
        <div class="shortcut-card">
          <header class="shortcut-header">
            <div class="shortcut-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8"/>
              </svg>
              <h3>Keyboard Shortcuts</h3>
            </div>
            <button class="shortcut-close" aria-label="Close modal" @click="isOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          <div class="shortcut-grid">
            <div v-for="shortcut in shortcuts" :key="shortcut.action" class="shortcut-row">
              <span class="shortcut-action">{{ shortcut.action }}</span>
              <div class="shortcut-keys">
                <kbd v-for="key in shortcut.keys" :key="key">{{ key }}</kbd>
              </div>
            </div>
          </div>

          <footer class="shortcut-footer">
            Press <kbd>?</kbd> anytime to open this modal.
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)

const shortcuts = [
  { action: 'Search documentation', keys: ['Ctrl', 'K'] },
  { action: 'Alternative Search', keys: ['/'] },
  { action: 'Toggle Translation', keys: ['Alt', 'T'] },
  { action: 'Open Shortcuts Helper', keys: ['?'] },
  { action: 'Close Modal / Dropdown', keys: ['ESC'] },
]

const handleKeydown = (e: KeyboardEvent) => {
  // Ignore inside inputs or editable elements
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }

  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    isOpen.value = !isOpen.value
  } else if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.shortcut-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.shortcut-card {
  width: 100%;
  max-width: 440px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shortcut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.shortcut-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-brand-1);
}

.shortcut-title h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.shortcut-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.shortcut-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.shortcut-grid {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.shortcut-action {
  color: var(--vp-c-text-1);
}

.shortcut-keys {
  display: flex;
  gap: 4px;
}

kbd {
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.shortcut-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-align: center;
}

.shortcut-fade-enter-active,
.shortcut-fade-leave-active {
  transition: opacity 0.15s ease;
}

.shortcut-fade-enter-from,
.shortcut-fade-leave-to {
  opacity: 0;
}
</style>
