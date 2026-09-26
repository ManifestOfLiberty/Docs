<template>
  <div v-if="tags.length" class="tags-container">
    <button 
      v-for="tag in tags" 
      :key="tag" 
      class="tag-chip" 
      type="button"
      @click="openTagExplorer(tag)"
    >
      <span class="hash">#</span>{{ tag }}
    </button>

    <TagExplorerModal 
      v-model="isModalOpen" 
      :active-tag="selectedTag" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import TagExplorerModal from './TagExplorerModal.vue'

const { frontmatter } = useData()
const isModalOpen = ref(false)
const selectedTag = ref('')

const tags = computed<string[]>(() => {
  const raw = frontmatter.value?.tags
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') return [raw]
  return []
})

const openTagExplorer = (tag: string) => {
  selectedTag.value = tag
  isModalOpen.value = true
}
</script>

<style scoped>
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.18s ease;
}

.tag-chip:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.hash {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
</style>
