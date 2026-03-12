import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import ProviderCard, { type Provider } from '../components/ProviderCard'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchResults, setSearchResults] = useState<Provider[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const navigate = useNavigate()

  const fetchTopProviders = useCallback(async (category?: string) => {
    let query = supabase
      .from('providers')
      .select(`*, reviews(count)`)
      .eq('status', 'approved')
      .order('avg_rating', { ascending: false })
      .limit(10)

    if (category) query = query.eq('category', category)

    const { data, error } = await query
    if (!error && data) {
      const mapped = (data as Array<Provider & { reviews?: Array<{ count: number }> }>).map((p) => ({
        ...p,
        review_count: p.reviews?.[0]?.count ?? 0,
      }))
      setProviders(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchTopProviders()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchTopProviders])

  function handleCategoryChange(category: string) {
    setActiveCategory(category)
    setSearchResults(null)
    setLoading(true)
    fetchTopProviders(category || undefined)
  }

  const displayProviders = searchResults ?? providers
  const isSearching = searchResults !== null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-200">
        <span className="text-2xl font-bold tracking-tight">
          Rate<span className="text-orange-500">.it</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/add-provider')}
            className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors"
          >
            + Add Provider
          </button>
          <a href="/admin" className="text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
            Admin
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gray-900 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 bg-orange-500/10 text-orange-400 border border-orange-500/20">
          Uganda's Review Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
          Find. Review. <span className="text-orange-500">Trust.</span>
        </h1>
        <p className="text-gray-400 text-base mb-8 max-w-md">
          Honest reviews for local service providers — restaurants, hospitals, schools & more.
        </p>
        <SearchBar onResults={setSearchResults} onLoading={setSearchLoading} />
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* CATEGORIES */}
        <CategoryGrid onCategoryChange={handleCategoryChange} />

        {/* PROVIDER GRID */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              {isSearching
                ? `Search Results (${displayProviders.length})`
                : activeCategory
                ? `${activeCategory} Providers`
                : 'Top Rated Providers'}
            </h2>
            {isSearching && (
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear search ×
              </button>
            )}
          </div>

          {/* Loading skeleton */}
          {(loading || searchLoading) && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded mb-3 w-3/5" />
                  <div className="h-3 bg-gray-100 rounded mb-4 w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && !searchLoading && displayProviders.length === 0 && (
            <div className="text-center py-20 rounded-2xl border border-gray-100 bg-white">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-700 font-medium mb-1">No providers found</p>
              <p className="text-sm text-gray-400">
                {isSearching ? 'Try a different search term.' : 'No approved providers in this category yet.'}
              </p>
            </div>
          )}

          {/* Results grid */}
          {!loading && !searchLoading && displayProviders.length > 0 && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {displayProviders.map((provider, i) => (
                <ProviderCard key={provider.id} provider={provider} rank={!isSearching ? i : undefined} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-200 bg-white mt-12">
        © {new Date().getFullYear()} Rate.it — Honest reviews, real accountability.
      </footer>
    </div>
  )
}