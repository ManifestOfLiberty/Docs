<template>
  <div v-if="relatedItems.length" class="related-section">
    <h3 class="related-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Recommended Next Reads
    </h3>

    <div class="related-grid">
      <a 
        v-for="item in relatedItems" 
        :key="item.link" 
        :href="withBase(item.link)"
        class="related-card"
      >
        <span class="card-section">{{ item.section }}</span>
        <span class="card-title">{{ item.text }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

interface PageItem {
  text: string
  link: string
  section: string
}

const { theme, page } = useData()

const currentPath = computed(() => {
  const rawPath = page.value.relativePath || ''
  return '/' + rawPath.replace(/\.md$/, '').replace(/\/index$/, '')
})

const relatedItems = computed<PageItem[]>(() => {
  const items: PageItem[] = []
  const sidebar = (theme.value as any)?.sidebar || []

  function walk(entries: SidebarItem[], currentSection: string) {
    for (const entry of entries) {
      const sectionName = entry.text || currentSection
      if (entry.link) {
        items.push({
          text: entry.text,
          link: entry.link,
          section: currentSection || 'Reference',
        })
      }
      if (entry.items && entry.items.length) {
        walk(entry.items, sectionName)
      }
    }
  }

  if (Array.isArray(sidebar)) {
    for (const group of sidebar) {
      if (group.items) {
        walk(group.items, group.text || 'Overview')
      }
    }
  }

  // Filter out the current page
  const filtered = items.filter(i => {
    const normalizeLink = i.link.replace(/\/index$/, '')
    return normalizeLink !== currentPath.value
  })

  // Prioritize items in the same section or return first 4
  const currentSectionMatch = filtered.filter(i => 
    currentPath.value.startsWith(i.link.split('/')[1] ? '/' + i.link.split('/')[1] : '')
  )

  return (currentSectionMatch.length ? currentSectionMatch : filtered).slice(0, 4)
})
</script>

<style scoped>
.related-section {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.related-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.related-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.related-card:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.15);
}

.card-section {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
</style>
