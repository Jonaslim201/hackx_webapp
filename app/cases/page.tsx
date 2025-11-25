"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Clock, MapPin, Search, User, PlusCircle } from 'lucide-react';
import type { CaseSummary } from '@/types/case';
import StatusBadge from '@/components/StatusBadge';

export default function CasesPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/cases')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (Array.isArray(json.cases)) {
          setCases(json.cases);
          setError(null);
        } else {
          setError(json.error || 'Failed to load cases');
        }
      })
      .catch((err) => !cancelled && setError(String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCases = useMemo(() => {
    if (!search.trim()) return cases;
    const lower = search.toLowerCase();
    return cases.filter((item) =>
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }, [cases, search]);

  const totalMarkers = useMemo(() => cases.reduce((sum, c) => sum + c.evidenceCount, 0), [cases]);
  const openCases = useMemo(() => cases.filter((c) => c.status === 'open').length, [cases]);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Live Operations</p>
              <h1 className="text-3xl font-bold text-foreground">HackX Case Management</h1>
              <p className="text-muted-foreground">Map viewer & evidence tracker connected to S3</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
              New Case
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search cases, tags, or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-border bg-secondary/40 px-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="grid flex-1 grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
                <p className="text-xs uppercase">Total Cases</p>
                <p className="text-2xl font-semibold text-foreground">{cases.length}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
                <p className="text-xs uppercase">Open</p>
                <p className="text-2xl font-semibold text-foreground">{openCases}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
                <p className="text-xs uppercase">Markers</p>
                <p className="text-2xl font-semibold text-foreground">{totalMarkers}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-48 animate-pulse rounded-2xl border border-border/40 bg-card/40" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="group block rounded-2xl border border-border/40 bg-card/40 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{caseItem.id}</span>
                    </div>
                    <StatusBadge status={caseItem.status} />
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-foreground group-hover:text-primary">
                    {caseItem.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{caseItem.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {caseItem.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary/40 px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(caseItem.updatedAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {caseItem.createdBy || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {caseItem.evidenceCount} markers
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {!filteredCases.length && !loading && (
              <div className="mt-10 rounded-2xl border border-border/50 bg-card/30 px-8 py-10 text-center text-muted-foreground">
                <p>No cases found for "{search}"</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
