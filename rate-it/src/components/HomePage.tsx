import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Provider {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  avg_rating: number;
}

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Restaurant: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    color: "bg-orange-50 text-orange-500 border-orange-100",
  },
  Hospital: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    color: "bg-red-50 text-red-500 border-red-100",
  },
  School: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>`,
    color: "bg-blue-50 text-blue-500 border-blue-100",
  },
  Bank: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>`,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  Hotel: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/></svg>`,
    color: "bg-purple-50 text-purple-500 border-purple-100",
  },
  Pharmacy: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>`,
    color: "bg-teal-50 text-teal-500 border-teal-100",
  },
  Salon: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>`,
    color: "bg-pink-50 text-pink-500 border-pink-100",
  },
  Supermarket: {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>`,
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [topProviders, setTopProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = Object.keys(categoryMeta);

  useEffect(() => {
    async function fetchTopProviders() {
      const { data, error } = await supabase
        .from("providers")
        .select("id, name, category, location, description, avg_rating")
        .eq("status", "approved")
        .order("avg_rating", { ascending: false })
        .limit(10);
      if (!error && data) setTopProviders(data);
      setLoading(false);
    }
    fetchTopProviders();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", backgroundColor: "#f8f7f4", color: "#1a1a1a" }}
    >
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b" style={{ backgroundColor: "#f8f7f4", borderColor: "#e8e5e0" }}>
        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Rate<span style={{ color: "#e85d26" }}>.it</span>
        </span>
        <div className="flex items-center gap-3">
          <a href="/providers" className="text-sm font-medium px-4 py-2 rounded-full transition" style={{ color: "#555" }}>Browse</a>
          <a href="/admin" className="text-sm font-medium px-4 py-2 rounded-full border transition" style={{ borderColor: "#ddd", color: "#333" }}>Admin</a>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "52vh", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3a2a1a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5" style={{ backgroundColor: "#e85d2620", color: "#e85d26", border: "1px solid #e85d2640" }}>
            Uganda's Review Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#fff", letterSpacing: "-0.02em" }}>
            Find. Review. <span style={{ color: "#e85d26" }}>Trust.</span>
          </h1>
          <p className="mb-8 text-base md:text-lg" style={{ color: "#aaa" }}>
            Honest reviews for local service providers — restaurants, hospitals, schools & more.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants, hospitals, schools..."
              className="flex-1 px-5 py-3.5 rounded-xl text-sm focus:outline-none"
              style={{ backgroundColor: "#fff", border: "1.5px solid #e8e5e0", color: "#1a1a1a" }}
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#e85d26", color: "#fff" }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-xl font-semibold mb-7" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            return (
              <a
                key={cat}
                href={`/search?category=${encodeURIComponent(cat)}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${meta.color}`}
                style={{ textDecoration: "none" }}
              >
                <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: meta.icon }} />
                <span className="text-sm font-semibold">{cat}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="py-14 px-6" style={{ backgroundColor: "#fff", borderTop: "1px solid #e8e5e0" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Top Rated Providers
            </h2>
            <a href="/providers" className="text-sm font-medium" style={{ color: "#e85d26" }}>View all →</a>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border p-6 animate-pulse" style={{ backgroundColor: "#f8f7f4", borderColor: "#e8e5e0" }}>
                  <div className="h-4 rounded mb-3" style={{ backgroundColor: "#e8e5e0", width: "60%" }} />
                  <div className="h-3 rounded mb-2" style={{ backgroundColor: "#e8e5e0", width: "40%" }} />
                  <div className="h-3 rounded" style={{ backgroundColor: "#e8e5e0", width: "80%" }} />
                </div>
              ))}
            </div>
          ) : topProviders.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border" style={{ borderColor: "#e8e5e0", color: "#999" }}>
              <p className="text-sm">No approved providers yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {topProviders.map((provider, i) => (
                <a
                  key={provider.id}
                  href={`/provider/${provider.id}`}
                  className="group block rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ backgroundColor: "#fafaf9", borderColor: "#e8e5e0", textDecoration: "none" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base leading-snug mb-0.5 group-hover:text-orange-600 transition-colors" style={{ color: "#1a1a1a" }}>
                        {provider.name}
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "#555" }}>
                        {provider.category}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: "#e85d2615", color: "#e85d26" }}>
                        #{i + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={provider.avg_rating} />
                    <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{provider.avg_rating.toFixed(1)}</span>
                  </div>
                  {provider.location && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "#888" }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {provider.location}
                    </p>
                  )}
                  {provider.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: "#777" }}>{provider.description}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-xs" style={{ borderTop: "1px solid #e8e5e0", backgroundColor: "#f8f7f4", color: "#aaa" }}>
        © {new Date().getFullYear()} Rate.it — Honest reviews, real accountability.
      </footer>
    </div>
  );
}