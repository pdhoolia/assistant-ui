"use client";
import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRepo, Repo } from "./RepoContext";

export const RepoPicker: FC = () => {
  const { selectedRepo, setSelectedRepo } = useRepo();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`${process.env['NEXT_PUBLIC_AGENT_HOOK_SERVER_URL']}/repositories`);
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepos(data);
        // Set the first repo as default if none is selected
        if (!selectedRepo?.url && data.length > 0) {
          setSelectedRepo(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (isLoading) {
    return <div>Loading repositories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Select
      value={selectedRepo?.url || ""}
      onValueChange={(value) => {
        const repo = repos.find((r) => r.url === value);
        if (repo) setSelectedRepo(repo);
      }}
      defaultValue={repos[0]?.url ?? ""}
    >
      <SelectTrigger className="max-w-[400px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {repos.map((repo) => (
          <SelectItem key={repo.url} value={repo.url}>
            <span>{repo.url}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};