import { ThreadState, Client } from "@langchain/langgraph-sdk";
import { LangChainMessage } from "@assistant-ui/react-langgraph";
import { Repo } from "@/components/shadcn/RepoContext";


const createClient = () => {
  const apiUrl =
    process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
    new URL("/api", window.location.href).href;
  return new Client({
    apiUrl,
  });
};

export const createAssistant = async (graphId: string) => {
  const client = createClient();
  return client.assistants.create({ graphId });
};

export const createThread = async () => {
  const client = createClient();
  return client.threads.create();
};

export const getThreadState = async (
  threadId: string,
): Promise<ThreadState<Record<string, unknown>>> => {
  const client = createClient();
  return client.threads.getState(threadId);
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Record<string, unknown>;
    asNode?: string;
  },
) => {
  const client = createClient();
  return client.threads.updateState(threadId, {
    values: fields.newState,
    asNode: fields.asNode!,
  });
};

export const sendMessage = async (params: {
  threadId: string;
  messages: LangChainMessage[];
  selectedRepo: Repo;
}) => {

  console.log("Repo:", params.selectedRepo);
  const client = createClient();

  const input: Record<string, unknown> | null = {
    messages: params.messages,
    repo: {
      url: params.selectedRepo.url,
      src_folder: params.selectedRepo.src_folder,
      branch: params.selectedRepo.branch,
    },
  };
  const config = {
    configurable: {
      code_suggestions_model: process.env['CODE_SUGGESTIONS_MODEL'],
      localization_model: process.env['LOCALIZATION_MODEL'],
      code_suggestions_system_prompt: "\nYou are a Code Assistant. You understand various programming languages. You understand code semantics and structures, e.g., functions, classes, enums. You understand user queries (or conversations) on code related issues and specialize in providing suggestions for changes in code to address those issues.\n\nFollowing files have been suggested as relevant to the issue being discussed:\n---\n\n{code_files}\n\n---\n\nPlease understand the issue being discussed in the provided conversation and suggest changes to the code in the provided files (or new ones) to address the issue. Please provide brief rationale for the changes as well.\n",
      file_localization_system_prompt: "\nYou are a Code Assistant. You understand various programming languages. You understand code semantics and structures, e.g., functions, classes, enums.\n\nLocalizing issues, or user queries (or conversations) to the most relevant code files is an important task in attempting to solve them. Its importance is underscored by the fact that contents of all the code files cannot be provided in a single prompt due to limits on the maximum number of tokens in the input. You are a specialist in this task of identifying the code files most relevant for the issue being discussed based on brief semantic summaries provided to you.\n\nFollowing semantic summaries of code files are provided to you in markdown format:\n---\n\n{file_summaries}\n\n---\n\nNote: filepaths are at heading level 1 (`# `).\n\nPlease understand the issue being discussed in the provided conversation and return the code file most related to the issue. You should also provide a brief (single line) rationale behind why you consider the file important to the issue. Your output should be formatted as a JSON with the following schema:\n```json\n{{\n    \"files\": [\n        {{\n            \"filepath\": \"<filepath>\",\n            \"rationale\": \"<your rationale for considering this file relevant, in a single concise sentence.>\"\n        }},\n    ]\n}}\n```\n\nFormal specification of the JSON format you should return is as follows:\n{format_instructions}\n",
      package_localization_system_prompt: "\nYou are a Code Assistant. You understand various programming languages. You understand code semantics and structures, e.g., functions, classes, enums. You also understand that code files may be grouped into packages based on some common theme.\n\nLocalizing issues, or user queries (or conversations) to the most relevant code packages is an important first task in attempting to solve them. Its importance is underscored by the fact that contents of all the code files cannot be provided in a single prompt due to limits on the maximum number of tokens in the input. You are a specialist in this task of identifying the code packages most relevant for the issue being discussed.\n\nFollowing semantic summaries of code packages are provided to you in markdown format:\n---\n\n{package_summaries}\n\n---\n\nNote: Package names are at heading level 1 (`# `).\n\nPlease understand the issue being discussed in the provided conversation and return the packages most related to the issue. You should also provide a brief (single line) rationale behind why you consider the package important to the issue. Your output should be formatted as a JSON with the following schema:\n```json\n{{\n    \"packages\": [\n        {{\n            \"package_name\": \"<name of the relevant package>\",\n            \"rationale\": \"<your rationale for considering this package relevant, in a single concise sentence.>\"\n        }}\n    ]\n}}\n```\n\nFormal specification of the JSON format you should return is as follows:\n{format_instructions}\n",
      gh_token: process.env['GITHUB_TOKEN'],
    }
  };

  return client.runs.stream(
    params.threadId,
    process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"]!,
    {
      input,
      config,
      streamMode: "messages",
    },
  );
};
