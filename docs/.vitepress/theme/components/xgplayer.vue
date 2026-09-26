<template>
  <div class="player-container">
    <div ref="playerRef" class="xgplayer-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

interface PlayerProps {
  url: string
  poster?: string
  autoplay?: boolean
  muted?: boolean
}

const props = withDefaults(defineProps<PlayerProps>(), {
  url: '',
  poster: '',
  autoplay: false,
  muted: true,
})

const playerRef = ref<HTMLElement | null>(null)
let playerInstance: Player | null = null

onMounted(() => {
  if (!playerRef.value || !props.url) return

  try {
    playerInstance = new Player({
      el: playerRef.value,
      url: props.url,
      poster: props.poster,
      autoplay: props.autoplay,
      volume: props.muted ? 0 : 0.7,
      lang: 'en',
      fluid: true,
      controls: true,
      leavePlayerTime: 1500,
      download: true,
      keyShortcut: true,
      start: {
        isShowPause: true,
      },
    })
  } catch (err) {
    console.error('Failed to initialize xgplayer:', err)
  }
})

onUnmounted(() => {
  if (playerInstance) {
    playerInstance.destroy()
    playerInstance = null
  }
})
</script>

<style scoped>
.player-container {
  margin: 1.25rem 0;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.xgplayer-wrapper {
  width: 100%;
  flex: auto;
}
</style>