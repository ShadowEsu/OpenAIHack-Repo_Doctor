"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GitBranch, Upload, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { connectRepository } from "@/lib/api";

export default function ConnectPage() {
  const router = useRouter();
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isValidGitHubUrl = (url: string): boolean => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return pattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!githubUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }

    if (!isValidGitHubUrl(githubUrl)) {
      setError("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)");
      return;
    }

    setIsSubmitting(true);

    try {
      const repo = await connectRepository(githubUrl);
      router.push(`/exam/${repo.id}/progress`);
    } catch (err) {
      setError("Failed to connect repository. Please check the URL and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // ZIP upload handling would go here
    setError("ZIP upload is not yet available. Please use the GitHub URL option.");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-24">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              Connect Repository
            </h1>
            <p className="text-sm text-text-secondary">
              Enter a GitHub URL or upload a ZIP archive to begin examination
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-strong bg-surface p-6 space-y-6">
            {/* GitHub URL Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="github-url"
                  className="flex items-center gap-2 text-sm font-medium text-text-primary"
                >
                  <GitBranch className="h-4 w-4" />
                  GitHub Repository URL
                </label>
                <input
                  id="github-url"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://github.com/owner/repo"
                  className={cn(
                    "w-full rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted",
                    "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent",
                    error ? "border-critical" : "border-strong"
                  )}
                />
                {error && (
                  <div className="flex items-center gap-2 text-xs text-critical">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!githubUrl.trim() || isSubmitting}
                className={cn(
                  "w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  !githubUrl.trim() || isSubmitting
                    ? "bg-surface-elevated text-text-muted cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-hover"
                )}
              >
                {isSubmitting ? "Connecting..." : "Begin Examination"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-text-muted">or</span>
              </div>
            </div>

            {/* ZIP Upload Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragging
                  ? "border-accent bg-accent-light"
                  : "border-border hover:border-border-strong"
              )}
            >
              <input
                type="file"
                accept=".zip"
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Upload ZIP file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setError("ZIP upload is not yet available. Please use the GitHub URL option.");
                  }
                }}
              />
              <Upload className="mb-3 h-8 w-8 text-text-muted" />
              <p className="mb-1 text-sm font-medium text-text-primary">
                Drop a ZIP file here
              </p>
              <p className="text-xs text-text-muted">
                Maximum size: 50 MB
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="rounded-lg bg-info-light p-4">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <div className="text-xs leading-relaxed text-info">
                <p className="font-medium mb-1">Privacy & Security</p>
                <p>
                  We only read your public repository contents. Your code is analyzed
                  in a secure environment and is never stored beyond the examination
                  session. No changes are made to your repository.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
