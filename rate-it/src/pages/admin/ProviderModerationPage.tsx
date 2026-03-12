import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Check, X, RefreshCw, Pencil, Save } from 'lucide-react'

interface PendingProvider {
  id: string
  name: string
  category: string
  location: string
  description: string
  created_at: string
}

interface EditState {
  name: string
  category: string
  location: string
  description: string
}

const categoryColors: Record<string, string> = {
  Restaurant: 'bg-orange-500/10 text-orange-400',
  Hospital: 'bg-red-500/10 text-red-400',
  School: 'bg-blue-500/10 text-blue-400',
  Bank: 'bg-emerald-500/10 text-emerald-400',
  Hotel: 'bg-purple-500/10 text-purple-400',
  Pharmacy: 'bg-teal-500/10 text-teal-400',
  Salon: 'bg-pink-500/10 text-pink-400',
  Supermarket: 'bg-yellow-500/10 text-yellow-400',
}

export default function ProviderModerationPage() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<PendingProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  async function fetchPendingProviders() {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) setProviders(data)
    setLoading(false)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('name')
    if (data) setCategories(data.map((c: { name: string }) => c.name))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingProviders()
    fetchCategories()
  }, [])

  function startEditing(provider: PendingProvider) {
    setEditingId(provider.id)
    setEditState({
      name: provider.name,
      category: provider.category,
      location: provider.location,
      description: provider.description,
    })
  }

  async function saveEdit(id: string) {
    if (!editState) return
    await supabase.from('providers').update(editState).eq('id', id)
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...editState } : p))
    )
    setEditingId(null)
    setEditState(null)
  }

  async function handleAction(id: string, action: 'approved' | 'rejected') {
    // Save any pending edits first
    if (editingId === id && editState) {
      await supabase.from('providers').update(editState).eq('id', id)
    }

    setActioningId(id)
    await supabase.from('providers').update({ status: action }).eq('id', id)
    setProviders((prev) => prev.filter((p) => p.id !== id))
    setActioningId(null)
    setEditingId(null)
    setEditState(null)
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
            <h1 className="text-2xl font-bold text-white mb-1">Provider Moderation</h1>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${providers.length} pending provider${providers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={fetchPendingProviders}
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
        {!loading && providers.length === 0 && (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-300 font-medium mb-1">All caught up!</p>
            <p className="text-sm text-gray-500">No pending providers to moderate.</p>
          </div>
        )}

        {/* Provider list */}
        {!loading && providers.length > 0 && (
          <div className="space-y-4">
            {providers.map((provider) => {
              const isEditing = editingId === provider.id
              const badgeColor = categoryColors[provider.category] ?? 'bg-gray-700 text-gray-300'

              return (
                <div
                  key={provider.id}
                  className={`bg-gray-900 border rounded-2xl p-5 transition-all ${
                    isEditing ? 'border-orange-500/40' : 'border-gray-800'
                  }`}
                >
                  {isEditing && editState ? (
                    /* ── Edit Mode ── */
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Name</label>
                          <input
                            value={editState.name}
                            onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Category</label>
                          <select
                            value={editState.category}
                            onChange={(e) => setEditState({ ...editState, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Location</label>
                          <input
                            value={editState.location}
                            onChange={(e) => setEditState({ ...editState, location: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Description</label>
                          <input
                            value={editState.description}
                            onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(provider.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-sm font-medium rounded-xl transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save edits
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditState(null) }}
                          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() => handleAction(provider.id, 'approved')}
                            disabled={actioningId === provider.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(provider.id, 'rejected')}
                            disabled={actioningId === provider.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── View Mode ── */
                    <>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-white mb-1">{provider.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {provider.category}
                            </span>
                            {provider.location && (
                              <span className="text-xs text-gray-500">{provider.location}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 shrink-0">
                          {new Date(provider.created_at).toLocaleDateString('en-UG', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>

                      {provider.description && (
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                          {provider.description}
                        </p>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleAction(provider.id, 'approved')}
                          disabled={actioningId === provider.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(provider.id, 'rejected')}
                          disabled={actioningId === provider.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => startEditing(provider)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl transition-colors ml-auto"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}