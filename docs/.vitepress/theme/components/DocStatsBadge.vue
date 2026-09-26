<template>
  <div v-if="isDocPage" class="doc-stats-container">
    <div class="doc-stats-badge">
      <div class="stat-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ readTimeText }}</span>
      </div>

      <span class="dot-divider">•</span>

      <div class="stat-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span>{{ formattedWordCount }} words</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter } = useData()
const route = useRoute()
const wordCount = ref(0)

const isDocPage = computed(() => {
  return frontmatter.value?.layout !== 'home'
})

const formattedWordCount = computed(() => {
  return wordCount.value > 0 ? wordCount.value.toLocaleString() : '---'
})

const readTimeText = computed(() => {
  if (wordCount.value <= 0) return '~1 min read'
  const minutes = Math.max(1, Math.ceil(wordCount.value / 180))
  return `~${minutes} min read`
})

const calculateStats = () => {
  if (typeof document === 'undefined') return
  const docContent = document.querySelector('.vp-doc') || document.querySelector('main')
  if (!docContent) return

  const text = docContent.textContent || ''
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  wordCount.value = words.length
}

const updateWithDelay = () => {
  nextTick(() => {
    calculateStats()
    setTimeout(calculateStats, 100)
    setTimeout(calculateStats, 400)
  })
}

onMounted(() => {
  updateWithDelay()
})

watch(() => route.path, () => {
  updateWithDelay()
})
</script>

<style scoped>
.doc-stats-container {
  margin: 0.5rem 0 1.25rem 0;
  display: flex;
  align-items: center;
}

.doc-stats-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px;
  border-radius: 9999px;
  background: rgba(147, 51, 234, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.28);
  backdrop-filter: blur(8px);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  box-shadow: 0 2px 10px rgba(147, 51, 234, 0.15);
  transition: all 0.2s ease;
}

.doc-stats-badge:hover {
  background: rgba(147, 51, 234, 0.18);
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.25);
  transform: translateY(-1px);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.stat-item svg {
  color: var(--vp-c-brand-1);
}

.dot-divider {
  color: rgba(168, 85, 247, 0.5);
  font-size: 0.8rem;
}
</style>
