import { create } from 'zustand'

interface AppStore {
  // State
  searchQuery: string
  selectedCategory: string
  moderationQueue: unknown[]

  // Actions
  setSearchQuery: (query: string) => void
  setCategory: (category: string) => void
  setModerationQueue: (queue: unknown[]) => void
}

const useAppStore = create<AppStore>((set) => ({
  // Initial state
  searchQuery: '',
  selectedCategory: '',
  moderationQueue: [],

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ selectedCategory: category }),
  setModerationQueue: (queue) => set({ moderationQueue: queue }),
}))

export default useAppStore