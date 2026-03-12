import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAppStore from '../../store/useAppStore'
import { ClipboardList, Store, CheckCircle, LogOut, ChevronRight } from 'lucide-react'

interface Stats {
  pendingReviews: number
  pendingProviders: number
  approvedProviders: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const setSession = useAppStore((s) => s.setSession)
  const session = useAppStore((s) => s.session)

  const [stats, setStats] = useState<Stats>({
    pendingReviews: 0,
    pendingProviders: 0,
    approvedProviders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)

    const [pendingReviewsRes, pendingProvidersRes, approvedProvidersRes] = await Promise.all([
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
    ])

    setStats({
      pendingReviews: pendingReviewsRes.count ?? 0,
      pendingProviders: pendingProvidersRes.count ?? 0,
      approvedProviders: approvedProvidersRes.count ?? 0,
    })

    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/admin/login')
  }

  const statCards = [
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      link: '/admin/reviews',
      urgent: stats.pendingReviews > 0,
    },
    {
      label: 'Pending Providers',
      value: stats.pendingProviders,
      icon: <Store className="w-5 h-5" />,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      link: '/admin/providers',
      urgent: stats.pendingProviders > 0,
    },
    {
      label: 'Approved Providers',
      value: stats.approvedProviders,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/providers',
      urgent: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">
            Rate<span className="text-orange-500">.it</span>
          </span>
          <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 hidden md:block">
            {session?.user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage providers and reviews</p>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {statCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.link)}
              className={`
                text-left p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg
                ${card.bg}
              `}
            >
              <div className={`flex items-center gap-2 mb-3 ${card.color}`}>
                {card.icon}
                {card.urgent && (
                  <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {loading ? (
                  <div className="h-8 w-12 bg-gray-700 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-sm text-gray-400">{card.label}</p>
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">
            Moderation Queues
          </h2>

          <button
            onClick={() => navigate('/admin/reviews')}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Review Moderation</p>
                <p className="text-xs text-gray-500">Approve or reject pending reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stats.pendingReviews > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                  {stats.pendingReviews} pending
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/providers')}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-400">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Provider Moderation</p>
                <p className="text-xs text-gray-500">Approve or reject pending providers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stats.pendingProviders > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                  {stats.pendingProviders} pending
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}