import { v4 as uuidv4 } from "uuid";
import { type AgentCard, type Message, AGENT_CARD_PATH } from "@a2a-js/sdk";
import {
  type AgentExecutor,
  type RequestContext,
  type ExecutionEventBus,
  DefaultRequestHandler,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";
import { runAgentDbLookup } from "./agent/db-look-up.ts";

export const agentCardPath = AGENT_CARD_PATH;

// 1. Define your agent's identity card.
export const helloAgentCard: AgentCard = {
  name: "Hello Agent",
  description: "A simple agent that says hello.",
  protocolVersion: "0.3.0",
  version: "0.1.0",
  url: "http://localhost:4000", // The public URL of your agent server
  skills: [{ id: "chat", name: "Chat", description: "Say hello", tags: ["chat"] }],
  capabilities: {
    pushNotifications: false,
  },
  preferredTransport: "HTTP+JSON",
  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],
  additionalInterfaces: [
    { url: "http://localhost:4000/a2a/rest", transport: "HTTP+JSON" }, // HTTP+JSON/REST transport
  ],
};

// 2. Implement the agent's logic.
class HelloExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus,
  ): Promise<void> {
    console.log("Received request:", requestContext);

    // Extract the user's message text
    const userMessage =
      requestContext.userMessage?.parts
        ?.filter((part): part is { kind: "text"; text: string } => part.kind === "text")
        ?.map((part) => part.text)
        ?.join(" ") || "";

    // Run the database lookup agent
    let agentResponse: string | undefined;
    try {
      agentResponse = await runAgentDbLookup(userMessage);
    } catch (error) {
      console.error("Error running agent:", error);
    }

    // Create a direct message response.
    const responseMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: agentResponse || "No response from agent" }],
      // Associate the response with the incoming request's context.
      contextId: requestContext.contextId,
    };

    // Publish the message and signal that the interaction is finished.
    eventBus.publish(responseMessage);
    eventBus.finished();
  }

  // cancelTask is not needed for this simple, non-stateful agent.
  cancelTask = async (): Promise<void> => {};
}

export function createRequestHandler(): DefaultRequestHandler {
  const agentExecutor = new HelloExecutor();
  return new DefaultRequestHandler(
    helloAgentCard,
    new InMemoryTaskStore(),
    agentExecutor,
  );
}
