"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Plus, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { RepositoryCard } from "@/components/repository/RepositoryCard";
import { getRepositories } from "@/lib/api";
import type { Repository } from "@/lib/types";

export default function ReposListPage() {
  const router = useRouter();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const repos = await getRepositories();
        setRepositories(repos);
      } catch (err) {
        console.error("Failed to fetch repositories:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelectRepository = (repo: Repository) => {
    router.push(`/app/repos/${repo.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Repositories</h1>
            <p className="text-sm text-text-muted">
              {repositories.length} {repositories.length === 1 ? "repository" : "repositories"} connected
            </p>
          </div>
          <button
            onClick={() => router.push("/connect")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-accent-hover"
            )}
          >
            <Plus className="h-4 w-4" />
            Connect Repository
          </button>
        </div>

        {/* Repository Grid */}
        {repositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-strong bg-surface py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-text-muted" />
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              No repositories connected
            </h3>
            <p className="mb-4 text-xs text-text-secondary">
              Connect a GitHub repository to start examining its health
            </p>
            <button
              onClick={() => router.push("/connect")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
                "transition-colors hover:bg-accent-hover"
              )}
            >
              <Plus className="h-4 w-4" />
              Connect Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {repositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                onClick={() => handleSelectRepository(repo)}
              />
            ))}
          </div>
        )}
      </div>
  );
}
