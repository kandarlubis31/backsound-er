import { create } from "zustand"

interface AudioState {
  currentSound: {
    id: number
    name: string
    slug: string
    audioUrl: string
    emoji: string | null
  } | null
  isPlaying: boolean
  duration: number
  currentTime: number
  volume: number
  isMuted: boolean

  play: (sound: {
    id: number
    name: string
    slug: string
    audioUrl: string
    emoji: string | null
  }) => void
  pause: () => void
  resume: () => void
  toggle: () => void
  stop: () => void
  setDuration: (duration: number) => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentSound: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,

  play: (sound) => {
    // If same sound is already loaded, just resume
    const current = get().currentSound
    if (current?.id === sound.id) {
      set({ isPlaying: true, currentTime: 0 })
      return
    }
    set({
      currentSound: sound,
      isPlaying: true,
      duration: 0,
      currentTime: 0,
    })
  },

  pause: () => set({ isPlaying: false }),

  resume: () => {
    if (get().currentSound) {
      set({ isPlaying: true })
    }
  },

  toggle: () => {
    const { isPlaying, currentSound } = get()
    if (!currentSound) return
    set({ isPlaying: !isPlaying })
  },

  stop: () =>
    set({
      currentSound: null,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
    }),

  setDuration: (duration) => set({ duration }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume, isMuted: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
}))
