import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, ArrowLeft, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StarRating from '../components/StarRating'
import SubmitReviewForm from '../components/SubmitReviewForm'

interface Provider {
  id: string
  name: string
  category: string
  location: string
  description: string
  avg_rating: number
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer_name: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  Restaurant: 'bg-orange-50 text-orange-600',
  Hospital: 'bg-red-50 text-red-600',
  School: 'bg-blue-50 text-blue-600',
  Bank: 'bg-emerald-50 text-emerald-700',
  Hotel: 'bg-purple-50 text-purple-600',
  Pharmacy: 'bg-teal-50 text-teal-600',
  Salon: 'bg-pink-50 text-pink-600',
  Supermarket: 'bg-yellow-50 text-yellow-700',
}

const PAGE_SIZE = 10

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [provider, setProvider] = useState<Provider | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [page, setPage] = useState(0)
  const [providerLoading, setProviderLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProvider()
      fetchReviews(0)
    }
  }, [id])

  async function fetchProvider() {
    setProviderLoading(true)
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error || !data) setNotFound(true)
    else setProvider(data)
    setProviderLoading(false)
  }

  async function fetchReviews(pageIndex: number) {
    setReviewsLoading(true)
    const from = pageIndex * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('provider_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (data) setReviews(data)
    if (count !== null) setReviewCount(count)
    setReviewsLoading(false)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchReviews(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(reviewCount / PAGE_SIZE)

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="flex items-center px-4 md:px-12 py-4 bg-white border-b border-gray-200">
          <span className="text-xl md:text-2xl font-bold tracking-tight">
            Rate<span className="text-orange-500">.it</span>
          </span>
        </nav>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-12 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (notFound || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4 md:px-6">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Provider not found</h2>
        <p className="text-sm text-gray-400 mb-6">This provider may be pending review or doesn't exist.</p>
        <button onClick={() => navigate('/')} className="text-sm font-medium text-orange-500 hover:text-orange-600">
          ← Back to home
        </button>
      </div>
    )
  }

  const badgeColor = categoryColors[provider.category] ?? 'bg-gray-100 text-gray-600'

  return (
    <>
      <Helmet>
        <title>{provider.name} — Rate.it</title>
        <meta
          name="description"
          content={
            provider.description
              ? `${provider.description} — Read reviews for ${provider.name} on Rate.it`
              : `Read reviews for ${provider.name} on Rate.it. Rated ${provider.avg_rating.toFixed(1)}/5 by the community.`
          }
        />
        <meta property="og:title" content={`${provider.name} — Rate.it`} />
        <meta property="og:description" content={`${provider.category} in ${provider.location}. Rated ${provider.avg_rating.toFixed(1)}/5.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* NAV */}
        <nav className="flex items-center justify-between px-4 md:px-12 py-4 bg-white border-b border-gray-200">
          <span className="text-xl md:text-2xl font-bold tracking-tight">
            Rate<span className="text-orange-500">.it</span>
          </span>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </nav>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6 md:space-y-8">

          {/* PROVIDER HEADER */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {provider.name}
                </h1>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeColor}`}>
                  {provider.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 mb-4 flex-wrap">
              <StarRating value={provider.avg_rating} size="lg" />
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                {provider.avg_rating > 0 ? provider.avg_rating.toFixed(1) : '—'}
              </span>
              <span className="text-sm text-gray-400">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {provider.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4 shrink-0" />
                {provider.location}
              </div>
            )}

            {provider.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{provider.description}</p>
            )}
          </div>

          {/* REVIEWS */}
          <section>
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                Reviews {reviewCount > 0 && <span className="text-gray-400 font-normal text-sm md:text-base">({reviewCount})</span>}
              </h2>
            </div>

            {reviewsLoading ? (
              <div className="space-y-3 md:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 md:py-14 bg-white border border-gray-100 rounded-2xl">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-gray-600 font-medium mb-1">No reviews yet</p>
                <p className="text-sm text-gray-400">Be the first to review this provider.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                          {(review.reviewer_name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {review.reviewer_name || 'Anonymous'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-UG', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5 md:mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </section>

          {/* SUBMIT REVIEW */}
          <section>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4 md:mb-5">Write a Review</h2>
            <SubmitReviewForm providerId={provider.id} />
          </section>
        </div>

        <footer className="text-center py-6 md:py-8 text-xs text-gray-400 border-t border-gray-200 bg-white mt-8 md:mt-12">
          © {new Date().getFullYear()} Rate.it — Honest reviews, real accountability.
        </footer>
      </div>
    </>
  )
}