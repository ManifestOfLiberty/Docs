<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vitepress'
import { useToast } from 'vue-toastification'

interface IssueFormData {
  type: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const route = useRoute()
const toast = useToast()

const isOpen = ref(false)
const isSubmitting = ref(false)

const form = reactive<IssueFormData>({
  type: '',
  title: '',
  description: '',
  severity: 'medium',
})

const resetForm = () => {
  form.type = ''
  form.title = ''
  form.description = ''
  form.severity = 'medium'
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const buildLabels = (): string => {
  const labelList = ['bug-report']
  
  const typeMap: Record<string, string> = {
    'broken-link': 'broken-link',
    'incorrect-info': 'documentation',
    'missing-content': 'enhancement',
    'malicious-link': 'security',
    'other': 'question',
  }

  if (form.type && typeMap[form.type]) {
    labelList.push(typeMap[form.type])
  }

  labelList.push(`severity-${form.severity}`)
  return labelList.join(',')
}

const buildIssueMarkdown = (): string => {
  const activeUrl = typeof window !== 'undefined' ? window.location.href : route.path
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'

  return [
    `## Description`,
    form.description,
    ``,
    `## Categorization`,
    `- **Issue Type**: ${form.type || 'Unspecified'}`,
    `- **Severity**: ${form.severity}`,
    ``,
    `## Environment Context`,
    `- **Reported Page**: ${activeUrl}`,
    `- **Browser User-Agent**: ${userAgent}`,
    `- **Timestamp**: ${new Date().toISOString()}`,
    ``,
    `---`,
    `*Reported via Manifest of Liberty interactive feedback widget.*`
  ].join('\n')
}

const handleSubmit = async () => {
  if (!form.title.trim() || !form.description.trim() || !form.type) {
    toast.warning('Please complete all required fields.')
    return
  }

  isSubmitting.value = true

  try {
    const repository = 'ManifestOfLiberty/Docs'
    const queryParams = new URLSearchParams({
      labels: buildLabels(),
      title: form.title.trim(),
      body: buildIssueMarkdown(),
    })

    const githubIssueUrl = `https://github.com/${repository}/issues/new?${queryParams.toString()}`

    if (typeof window !== 'undefined') {
      window.open(githubIssueUrl, '_blank', 'noopener,noreferrer')
    }

    toast.success('Redirecting to GitHub to submit issue...')
    closeModal()
  } catch (err) {
    console.error('Failed to launch issue creator:', err)
    toast.error('Unable to open issue creator. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="report-wrapper">
    <button 
      class="report-btn"
      :class="{ 'report-btn--active': isOpen }"
      aria-label="Report documentation issue"
      title="Report an issue on this page"
      @click="isOpen = true"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal" role="dialog" aria-modal="true">
          <div class="modal-card">
            <header class="modal-header">
              <div class="modal-title">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <h3>Report Page Issue</h3>
              </div>
              <button class="modal-close" aria-label="Close dialog" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </header>

            <form class="modal-form" @submit.prevent="handleSubmit">
              <div class="field-row">
                <div class="field-group flex-1">
                  <label for="report-type">Issue Type <span class="required">*</span></label>
                  <select id="report-type" v-model="form.type" required>
                    <option value="" disabled>Select category...</option>
                    <option value="broken-link">Broken Link or Reference</option>
                    <option value="incorrect-info">Inaccurate Technical Details</option>
                    <option value="missing-content">Missing Documentation / Outdated API</option>
                    <option value="malicious-link">Security or Safety Concern</option>
                    <option value="other">General Feedback / Suggestion</option>
                  </select>
                </div>

                <div class="field-group w-36">
                  <label for="report-severity">Severity</label>
                  <select id="report-severity" v-model="form.severity">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div class="field-group">
                <label for="report-title">Summary Title <span class="required">*</span></label>
                <input 
                  id="report-title"
                  v-model="form.title"
                  type="text"
                  placeholder="e.g., Outdated payload structure in MRC request"
                  required
                />
              </div>

              <div class="field-group">
                <label for="report-desc">Description <span class="required">*</span></label>
                <textarea 
                  id="report-desc"
                  v-model="form.description"
                  rows="4"
                  placeholder="Describe the issue, what you expected, and steps to reproduce..."
                  required
                ></textarea>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <span>{{ isSubmitting ? 'Opening GitHub...' : 'Submit to GitHub' }}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.report-wrapper {
  display: inline-flex;
  align-items: center;
}

.report-btn {
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
  transition: all 0.18s ease;
}

.report-btn:hover,
.report-btn--active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

.modal-backdrop {
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

.modal-card {
  width: 100%;
  max-width: 520px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-brand-1);
}

.modal-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.modal-close {
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

.modal-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.modal-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-row {
  display: flex;
  gap: 0.75rem;
}

.flex-1 { flex: 1; }
.w-36 { width: 140px; }

label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.required {
  color: #ef4444;
}

input, select, textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

textarea {
  resize: vertical;
  min-height: 90px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn-secondary:hover {
  background: var(--vp-c-bg-alt);
}

.btn-primary {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  border: 1px solid transparent;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(147, 51, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #a855f7, #8b5cf6);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: scale(0.96) translateY(6px);
  opacity: 0;
}
</style>