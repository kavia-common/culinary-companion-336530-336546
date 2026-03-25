"use client";

import React from "react";
import { DEMO_RECIPES, type Recipe } from "@/lib/demoData";
import { getBackendHealth } from "@/lib/api";

type BackendStatus =
  | { state: "loading" }
  | { state: "online" }
  | { state: "offline"; message: string };

function starString(rating: number): string {
  const rounded = Math.round(rating);
  return "★★★★★☆☆☆☆☆".slice(5 - rounded, 10 - rounded);
}

export default function Home() {
  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [backend, setBackend] = React.useState<BackendStatus>({ state: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getBackendHealth();
      if (cancelled) return;
      if (res.ok) setBackend({ state: "online" });
      else setBackend({ state: "offline", message: res.error });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tags = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of DEMO_RECIPES) for (const t of r.tags) s.add(t);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_RECIPES.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || r.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar-inner">
          <div className="brand" aria-label="Culinary Companion">
            <span className="brand-badge" aria-hidden="true">
              CC
            </span>
            <span>Culinary Companion</span>
          </div>

          <div className="pill" aria-label="Backend connection status">
            <span className="muted" style={{ fontSize: 13 }}>
              API
            </span>
            {backend.state === "loading" && <span className="muted">Checking…</span>}
            {backend.state === "online" && (
              <span style={{ color: "var(--color-success)", fontSize: 13, fontWeight: 600 }}>
                Online
              </span>
            )}
            {backend.state === "offline" && (
              <span style={{ color: "var(--color-error)", fontSize: 13, fontWeight: 600 }}>
                Offline
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 18, paddingBottom: 28 }}>
        <section className="card" style={{ padding: 18 }}>
          <h1 style={{ fontSize: 26, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Find your next meal
          </h1>
          <p className="muted" style={{ marginBottom: 12 }}>
            Search recipes by name, description, or tags.{" "}
            <span className="kbd" title="Keyboard hint">
              Ctrl/⌘ + K
            </span>{" "}
            coming soon.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <label style={{ flex: "1 1 280px" }}>
              <span className="muted" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                Search
              </span>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. pasta, spicy, meal-prep…"
                aria-label="Search recipes"
                style={{ width: "100%" }}
              />
            </label>

            <div style={{ flex: "0 0 auto", display: "flex", gap: 10, alignItems: "end" }}>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveTag(null);
                }}
                aria-label="Clear filters"
              >
                Clear
              </button>
              <button className="btn btn-primary" type="button" disabled aria-disabled="true">
                + New recipe
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => setActiveTag(null)}
              aria-pressed={activeTag === null}
              style={{
                borderColor: activeTag === null ? "rgba(59, 130, 246, 0.6)" : undefined,
              }}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                className="btn"
                onClick={() => setActiveTag(t)}
                aria-pressed={activeTag === t}
                style={{
                  borderColor: activeTag === t ? "rgba(59, 130, 246, 0.6)" : undefined,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {backend.state === "offline" && (
            <p style={{ marginTop: 12, color: "var(--color-error)", fontSize: 13 }}>
              Backend is currently unavailable: <span className="muted">{backend.message}</span>
            </p>
          )}
        </section>

        <section style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <h2 style={{ fontSize: 18, letterSpacing: "-0.01em" }}>
              Recipes{" "}
              <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>
                ({filtered.length})
              </span>
            </h2>
            <p className="muted" style={{ fontSize: 13 }}>
              Demo data shown until backend endpoints are implemented.
            </p>
          </div>

          <div className="grid cols-3">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      </main>

      <footer className="container" style={{ paddingBottom: 22 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          Next steps: auth, favorites, recipe CRUD, reviews, shopping list generator, admin panel.
        </div>
      </footer>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="card" aria-label={`Recipe: ${recipe.title}`}>
      <header style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: 16, letterSpacing: "-0.01em" }}>{recipe.title}</h3>
        <span className="muted" style={{ fontSize: 12 }}>
          {starString(recipe.rating)}
        </span>
      </header>

      <p className="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 1.35 }}>
        {recipe.description}
      </p>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {recipe.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid rgba(17, 24, 39, 0.12)",
              background: "rgba(59, 130, 246, 0.06)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div className="muted" style={{ fontSize: 13 }}>
          {recipe.minutes} min · {recipe.servings} servings
        </div>
        <button className="btn" type="button" disabled aria-disabled="true">
          View
        </button>
      </div>
    </article>
  );
}
