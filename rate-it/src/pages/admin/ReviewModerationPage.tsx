import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Check, X, RefreshCw } from 'lucide-react'
import StarRating from '../../components/StarRating'

interface PendingReview {
  id: string
  rating: number
  comment: string
  reviewer_name: string
  created_at: string
  provider_id: string
  providers: {
    name: string
  }
}

export default function ReviewModerationPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<PendingReview[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  async function fetchPendingReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, providers(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) setReviews(data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingReviews()
  }, [])

  async function handleAction(id: string, action: 'approved' | 'rejected') {
    setActioningId(id)
    await supabase.from('reviews').update({ status: action }).eq('id', id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setActioningId(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            Rate<span className="text-orange-500">.it</span>
          </span>
          <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Review Moderation</h1>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${reviews.length} pending review${reviews.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={fetchPendingReviews}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-300 font-medium mb-1">All caught up!</p>
            <p className="text-sm text-gray-500">No pending reviews to moderate.</p>
          </div>
        )}

        {/* Review list */}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                        {(review.reviewer_name || 'A')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {review.reviewer_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">
                        {review.providers?.name ?? 'Unknown Provider'}
                      </span>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {new Date(review.created_at).toLocaleDateString('en-UG', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {review.comment}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(review.id, 'approved')}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, 'rejected')}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}