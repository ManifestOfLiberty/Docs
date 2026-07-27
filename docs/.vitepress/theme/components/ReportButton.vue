<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vitepress'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()
const showPopup = ref(false)
const isSubmitting = ref(false)
const formData = reactive({
  type: '',
  title: '',
  description: '',
  url: '',
  severity: 'medium'
})

const closePopup = () => {
  showPopup.value = false
  // Reset form
  Object.assign(formData, {
    type: '',
    title: '',
    description: '',
    url: '',
    severity: 'medium'
  })
}

const submitReport = async () => {
  isSubmitting.value = true
  
  try {
    const repo = 'openm/pages'
    const labels = getLabels()
    const title = encodeURIComponent(formData.title)
    const body = generateIssueBody()
    
    const issueUrl = `https://codeberg.org/${repo}/issues/new?labels=${labels}&title=${title}&body=${encodeURIComponent(body)}`
    
    // Open Codeberg issue creation page
    window.open(issueUrl, '_blank', 'noopener,noreferrer')
    
    // Show success message
    toast.success('Issue submitted successfully!')
    
    closePopup()
  } catch (error) {
    console.error('Error submitting issue:', error)
    toast.error('Failed to submit issue. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const getLabels = () => {
  const labels = ['bug-report']
  
  switch (formData.type) {
    case 'broken-link':
      labels.push('broken-link')
      break
    case 'incorrect-info':
      labels.push('documentation')
      break
    case 'missing-content':
      labels.push('enhancement')
      break
    case 'malicious-link':
      labels.push('security')
      break
    case 'other':
      labels.push('question')
      break
  }
  
  labels.push(`severity-${formData.severity}`)
  
  return labels.join(',')
}

const generateIssueBody = () => {
  const currentPage = typeof window !== 'undefined' ? window.location.href : route.path
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
  
  return `## Issue Description
${formData.description}

## Issue Type
${formData.type}

## Severity
${formData.severity}

## Additional Information
- **Current Page**: ${currentPage}
- **Reported URL**: ${formData.url || 'N/A'}
- **User Agent**: ${userAgent}
- **Reported At**: ${new Date().toISOString()}

---
*This issue was automatically generated.*`
}
</script>

<template>
  <div class="report-button-container">
    <button 
      @click="showPopup = true" 
      class="report-button"
      aria-label="Submit an issue on this page"
      title="Submit an issue"
    >
    <svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 853.333333a341.333333 341.333333 0 1 0 0-682.666666 341.333333 341.333333 0 0 0 0 682.666666z m0 85.333334C276.352 938.666667 85.333333 747.648 85.333333 512S276.352 85.333333 512 85.333333s426.666667 191.018667 426.666667 426.666667-191.018667 426.666667-426.666667 426.666667z m-42.666667-256h85.333334v85.333333h-85.333334v-85.333333z m0-426.666667h85.333334v341.333333h-85.333334V256z" fill/></svg>
    </button>

    <!-- Popup Modal -->
    <Teleport to="body">
      <div v-if="showPopup" class="popup-overlay" @click="closePopup">
        <div class="popup-content" @click.stop>
          <div class="popup-header">
            <h3>Submit an Issue</h3>
            <button @click="closePopup" class="close-button" aria-label="Close issue dialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="popup-body">
            <form @submit.prevent="submitReport">
              <div class="form-group">
                <label for="issue-type">Issue Type:</label>
                <select id="issue-type" v-model="formData.type" required>
                  <option value="">Select an issue type</option>
                  <option value="broken-link">Broken Link</option>
                  <option value="incorrect-info">Incorrect Information</option>
                  <option value="missing-content">Missing Content</option>
                  <option value="malicious-link">Malicious Link</option>
                  <option value="add-content">Add Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="issue-title">Title:</label>
                <input 
                  id="issue-title" 
                  v-model="formData.title" 
                  type="text" 
                  placeholder="Enter a brief title"
                  required
                />
              </div>

              <div class="form-group">
                <label for="issue-description">Description:</label>
                <textarea 
                  id="issue-description" 
                  v-model="formData.description" 
                  placeholder="Describe the issue in detail"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label for="issue-url">URL (if applicable):</label>
                <input 
                  id="issue-url" 
                  v-model="formData.url" 
                  type="url" 
                  placeholder="Enter the problematic URL"
                />
              </div>

              <div class="form-group">
                <label for="issue-severity">Severity:</label>
                <select id="issue-severity" v-model="formData.severity">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" @click="closePopup" class="cancel-button">
                  Cancel
                </button>
                <button type="submit" class="submit-button" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Submitting...</span>
                  <span v-else>Submit Issue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.report-button-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-button {
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
  transition: all 0.2s ease;
  cursor: pointer;
}

.report-button:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

.report-button:active {
  background-color: var(--vp-c-bg-soft-down);
}

.report-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Popup styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: var(--vp-c-bg);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.popup-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.close-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  border-radius: 0.25rem;
}

.close-button:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.popup-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9375rem;
  transition: border-color 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="url"]:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 2px var(--vp-c-brand-translucent);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.cancel-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: var(--vp-c-bg-soft-up);
  border-color: var(--vp-c-divider);
}

.submit-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand);
  border-radius: 0.375rem;
  background-color: var(--vp-c-brand);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--vp-c-brand-dark);
  border-color: var(--vp-c-brand-dark);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive styles */
@media (max-width: 768px) {
  .popup-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>