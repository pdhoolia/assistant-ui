import { AssistantCloud } from "@assistant-ui/react";

export const POST = async () => {
  const userId = 'anonymous';

  const client = new AssistantCloud({ 
    apiKey: process.env["ASSISTANT_API_KEY"]!,
    userId,
    workspaceId: userId,
  });
  
  const { token } = await client.auth.tokens.create();
  console.log(`token: ${token}`);
  return Response.json({ token });
};
