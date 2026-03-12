import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, RefreshCw, Pencil, Save, X, EyeOff, Flag } from 'lucide-react'

interface Provider {
  id: string
  name: string
  category: string
  location: string
  description: string
  avg_rating: number
  status: string
  created_at: string
}

interface EditState {
  name: string
  category: string
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

export default function ManageProvidersPage() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProviders()
    fetchCategories()
  }, [])

  async function fetchProviders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('status', 'approved')
      .order('name', { ascending: true })

    if (!error && data) setProviders(data)
    setLoading(false)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('name').order('name')
    if (data) setCategories(data.map((c: { name: string }) => c.name))
  }

  function startEditing(provider: Provider) {
    setEditingId(provider.id)
    setEditState({
      name: provider.name,
      category: provider.category,
      description: provider.description,
    })
  }

  async function saveEdit(id: string) {
    if (!editState) return
    setActioningId(id)
    await supabase.from('providers').update(editState).eq('id', id)
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...editState } : p))
    )
    setEditingId(null)
    setEditState(null)
    setActioningId(null)
  }

  async function handleStatusChange(id: string, status: 'inactive' | 'flagged') {
    setActioningId(id)
    await supabase.from('providers').update({ status }).eq('id', id)
    setProviders((prev) => prev.filter((p) => p.id !== id))
    setActioningId(null)
  }

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Manage Providers</h1>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${providers.length} approved provider${providers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={fetchProviders}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category or location..."
          className="w-full px-4 py-3 rounded-xl text-sm bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6 transition-all"
        />

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-gray-300 font-medium mb-1">No providers found</p>
            <p className="text-sm text-gray-500">
              {search ? 'Try a different search term.' : 'No approved providers yet.'}
            </p>
          </div>
        )}

        {/* Provider list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((provider) => {
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
                    /* Edit Mode */
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
                        <div className="sm:col-span-2">
                          <label className="text-xs text-gray-500 block mb-1">Description</label>
                          <textarea
                            value={editState.description}
                            onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(provider.id)}
                          disabled={actioningId === provider.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditState(null) }}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-semibold text-white">{provider.name}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {provider.category}
                          </span>
                          {provider.location && (
                            <span className="text-xs text-gray-500">{provider.location}</span>
                          )}
                        </div>
                        {provider.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{provider.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-amber-400">★</span>
                          <span className="text-xs text-gray-400">{provider.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEditing(provider)}
                          className="p-2 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(provider.id, 'flagged')}
                          disabled={actioningId === provider.id}
                          className="p-2 text-gray-500 hover:text-yellow-400 bg-gray-800 hover:bg-yellow-500/10 rounded-xl transition-colors disabled:opacity-50"
                          title="Flag"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(provider.id, 'inactive')}
                          disabled={actioningId === provider.id}
                          className="p-2 text-gray-500 hover:text-red-400 bg-gray-800 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                          title="Deactivate"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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