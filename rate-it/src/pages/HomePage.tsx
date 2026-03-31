import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import ProviderCard, { type Provider } from '../components/ProviderCard'

export default function HomePage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchResults, setSearchResults] = useState<Provider[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const navigate = useNavigate()

  async function fetchTopProviders(category?: string) {
    setLoading(true)
    let query = supabase
      .from('providers')
      .select(`*, reviews(count)`)
      .eq('status', 'approved')
      .order('avg_rating', { ascending: false })
      .limit(9)

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
  }

  useEffect(() => {
    fetchTopProviders()
  }, [])

  function handleCategoryChange(category: string) {
    setActiveCategory(category)
    setSearchResults(null)
    fetchTopProviders(category || undefined)
  }

  const displayProviders = searchResults ?? providers
  const isSearching = searchResults !== null

  return (
    <>
      <Helmet>
        <title>Rate.it — Honest Reviews for Local Providers in Uganda</title>
        <meta
          name="description"
          content="Find and review local service providers in Uganda. Restaurants, hospitals, schools, banks and more — rated by real people."
        />
        <meta property="og:title" content="Rate.it — Honest Reviews for Local Providers" />
        <meta property="og:description" content="Discover trusted local providers rated by your community." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* NAV */}
        <nav className="flex items-center justify-between px-4 md:px-12 py-5 bg-white border-b border-gray-200">
          <span className="text-xl md:text-2xl font-bold tracking-tight">
            Rate<span className="text-orange-500">.it</span>
          </span>
          <button
            onClick={() => navigate('/add-provider')}
            className="text-xs md:text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-3 md:px-4 py-2 rounded-full transition-colors"
          >
            + Add Provider
          </button>
        </nav>

        {/* HERO */}
        <section className="bg-gray-900 flex flex-col items-center justify-center text-center px-4 md:px-6 py-16 md:py-24">
          <div className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Uganda's Review Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3 tracking-tight">
            Find. Review. <span className="text-orange-500">Trust.</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-6 max-w-sm md:max-w-md">
            Honest reviews for local service providers — restaurants, hospitals, schools & more.
          </p>
          <div className="w-full max-w-xl">
            <SearchBar onResults={setSearchResults} onLoading={setSearchLoading} />
          </div>

          {/* Inline search results dropdown */}
          {isSearching && (
            <div className="w-full max-w-xl mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-left">
              {searchLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3 items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded w-2/3 mb-1" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayProviders.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">No providers found for your search.</p>
                  <button
                    onClick={() => navigate('/add-provider')}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    + Add this Provider
                  </button>
                </div>
              ) : (
                <div>
                  {displayProviders.slice(0, 5).map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => navigate(`/provider/${provider.id}`)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                        <p className="text-xs text-gray-400">{provider.category} · {provider.location}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-medium text-gray-600">
                          {provider.avg_rating > 0 ? provider.avg_rating.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {displayProviders.length > 5 && (
                    <div className="px-4 py-2 text-center text-xs text-gray-400">
                      +{displayProviders.length - 5} more results below
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-100 text-right">
                    <button
                      onClick={() => setSearchResults(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8 md:space-y-10">

          {/* CATEGORIES — compact */}
          <CategoryGrid onCategoryChange={handleCategoryChange} />

          {/* PROVIDER GRID */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
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
                  Clear ×
                </button>
              )}
            </div>

            {/* Loading skeleton */}
            {(loading || searchLoading) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
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
              <div className="text-center py-16 rounded-2xl border border-gray-100 bg-white">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-700 font-medium mb-1">No providers found</p>
                <p className="text-sm text-gray-400 mb-5">
                  {isSearching
                    ? "Can't find what you're looking for? Add it yourself."
                    : 'No approved providers in this category yet.'}
                </p>
                {isSearching && (
                  <button
                    onClick={() => navigate('/add-provider')}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    + Add this Provider
                  </button>
                )}
              </div>
            )}

            {/* Results grid */}
            {!loading && !searchLoading && displayProviders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {displayProviders.map((provider, i) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    rank={!isSearching ? i : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <footer className="text-center py-6 md:py-8 text-xs text-gray-400 border-t border-gray-200 bg-white mt-8 md:mt-12">
          © {new Date().getFullYear()} Rate.it — Honest reviews, real accountability.
        </footer>
      </div>
    </>
  )
}