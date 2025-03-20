"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Repo {
  url: string;
  src_folder: string;
  branch: string;
}

const defaultRepo: Repo = {
  url: "",
  src_folder: "",
  branch: "",
};

const RepoContext = createContext<{
  selectedRepo: Repo;
  setSelectedRepo: (repo: Repo) => void;
}>({
  selectedRepo: defaultRepo,
  setSelectedRepo: () => {},
});

export const RepoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRepo, setSelectedRepo] = useState<Repo>(defaultRepo);

  return (
    <RepoContext.Provider value={{ selectedRepo, setSelectedRepo }}>
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);