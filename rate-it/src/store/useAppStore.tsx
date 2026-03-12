import { create } from 'zustand'
import type{ Session } from '@supabase/supabase-js'

interface AppStore {
  // State
  searchQuery: string
  selectedCategory: string
  moderationQueue: any[]
  session: Session | null

  // Actions
  setSearchQuery: (query: string) => void
  setCategory: (category: string) => void
  setModerationQueue: (queue: any[]) => void
  setSession: (session: Session | null) => void
}

const useAppStore = create<AppStore>((set) => ({
  // Initial state
  searchQuery: '',
  selectedCategory: '',
  moderationQueue: [],
  session: null,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (category) => set({ selectedCategory: category }),
  setModerationQueue: (queue) => set({ moderationQueue: queue }),
  setSession: (session) => set({ session }),
}))

export default useAppStore