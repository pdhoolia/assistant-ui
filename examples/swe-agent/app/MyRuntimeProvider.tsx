"use client";

import {
  AssistantCloud,
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
  useThreadListItemRuntime,
} from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { LangChainMessage } from "@assistant-ui/react-langgraph";
import { RepoProvider, useRepo } from "@/components/shadcn/RepoContext";

const useMyLangGraphRuntime = () => {
  const { selectedRepo } = useRepo();
  const threadListItemRuntime = useThreadListItemRuntime();
  const runtime = useLangGraphRuntime({
    stream: async function* (messages) {
      const { externalId } = await threadListItemRuntime.initialize();
      if (!externalId) throw new Error("Thread not found");

      const generator = await sendMessage({
        threadId: externalId,
        messages,
        selectedRepo,
      });

      for await (const message of generator) {
        yield message;
      }
    },
    onSwitchToThread: async (externalId) => {
      const state = await getThreadState(externalId);
      return {
        messages:
          (state.values as { messages?: LangChainMessage[] }).messages ?? [],
        interrupts: state.tasks[0]?.interrupts ?? [],
      };
    },
  });

  return runtime;
};

const cloud = new AssistantCloud({
  baseUrl: process.env["NEXT_PUBLIC_ASSISTANT_BASE_URL"]!,
  authToken: () =>
    fetch("/api/assistant-ui-token", { method: "POST" })
      .then((r) => r.json())
      .then((r) => r.token),
});

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtime = useCloudThreadListRuntime({
    cloud,
    runtimeHook: useMyLangGraphRuntime,
    create: async () => {
      const { thread_id } = await createThread();
      return { externalId: thread_id };
    },
  });

  return (
    <RepoProvider>
      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </RepoProvider>
  );
}
