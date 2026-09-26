<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useData, withBase } from 'vitepress'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

interface PageLink {
  section: string
  title: string
  link: string
}

const props = defineProps<{
  modelValue: boolean
  activeTag: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { theme } = useData()
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const closeModal = () => {
  emit('update:modelValue', false)
}

// Extract all pages from sidebar structure
const allDocPages = computed<PageLink[]>(() => {
  const pages: PageLink[] = []
  const sidebar = (theme.value as any)?.sidebar || []

  function walk(items: SidebarItem[], currentSection: string) {
    for (const item of items) {
      const sectionName = item.text || currentSection
      if (item.link) {
        pages.push({
          section: currentSection || 'General',
          title: item.text,
          link: item.link,
        })
      }
      if (item.items && item.items.length) {
        walk(item.items, sectionName)
      }
    }
  }

  if (Array.isArray(sidebar)) {
    for (const group of sidebar) {
      if (group.items) {
        walk(group.items, group.text || 'Documentation')
      }
    }
  }

  return pages
})

// Filter pages matching active tag or search query
const filteredPages = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const tag = props.activeTag.toLowerCase().trim()

  return allDocPages.value.filter(page => {
    const titleMatch = page.title.toLowerCase().includes(query)
    const sectionMatch = page.section.toLowerCase().includes(query)
    const tagMatch = !tag || page.title.toLowerCase().includes(tag) || page.link.toLowerCase().includes(tag) || page.section.toLowerCase().includes(tag)

    return tagMatch && (titleMatch || sectionMatch)
  })
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    setTimeout(() => searchInputRef.value?.focus(), 50)
  }
})

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

<template>
  <Teleport to="body">
    <Transition name="tag-modal-fade">
      <div v-if="modelValue" class="tag-modal-backdrop" @click.self="closeModal" role="dialog" aria-modal="true">
        <div class="tag-modal-card">
          <header class="tag-modal-header">
            <div class="tag-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>#{{ activeTag || 'all-topics' }}</span>
            </div>
            
            <button class="tag-modal-close" aria-label="Close modal" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          <div class="tag-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              ref="searchInputRef"
              v-model="searchQuery" 
              type="text" 
              placeholder="Filter topics..."
            />
          </div>

          <div class="tag-results-list">
            <div v-if="filteredPages.length === 0" class="empty-state">
              No matching pages found for "#{{ activeTag }}".
            </div>

            <a 
              v-for="page in filteredPages" 
              :key="page.link"
              :href="withBase(page.link)"
              class="result-item"
              @click="closeModal"
            >
              <div class="result-info">
                <span class="result-section">{{ page.section }}</span>
                <span class="result-title">{{ page.title }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tag-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.tag-modal-card {
  width: 100%;
  max-width: 540px;
  max-height: 80vh;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tag-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  font-weight: 600;
}

.tag-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-modal-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.tag-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.tag-search-bar input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.925rem;
  outline: none;
}

.tag-results-list {
  overflow-y: auto;
  padding: 0.5rem 0;
  max-height: 400px;
}

.empty-state {
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: background 0.15s ease;
}

.result-item:hover {
  background: var(--vp-c-bg-soft);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-section {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
}

.result-title {
  font-size: 0.925rem;
  font-weight: 500;
}

.arrow-icon {
  color: var(--vp-c-text-3);
  transition: transform 0.15s ease, color 0.15s ease;
}

.result-item:hover .arrow-icon {
  color: var(--vp-c-brand-1);
  transform: translateX(2px);
}

.tag-modal-fade-enter-active,
.tag-modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.tag-modal-fade-enter-from,
.tag-modal-fade-leave-to {
  opacity: 0;
}
</style>
