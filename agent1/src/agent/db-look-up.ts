import { Agent, run, setDefaultOpenAIClient, setOpenAIAPI, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { get, getAll, has } from "../db/key-value.ts";

// Configure custom OpenAI client for ZEISS GenAI API
const client = new OpenAI({
  baseURL: "https://api.genai.zeiss.com/openai/deployments/gpt-51",
  defaultHeaders: {
    "api-key": process.env.AI_API_KEY || "",
  },
  defaultQuery: {
    "api-version": "2024-10-21",
  },
  apiKey: "unused", // Required by OpenAI client but we use api-key header instead
});

setDefaultOpenAIClient(client);
setOpenAIAPI("chat_completions");

// Tool to look up a value by key in the database
export const cakeLookupTool = tool({
  name: "cake_lookup",
  description:
    "Look up a cake by name in the database to get its description. Use this to check if a cake is available and what it contains.",
  parameters: z.object({
    key: z
      .string()
      .describe("The cake name to look up (e.g., chocolate_cake, red_velvet, tiramisu)"),
  }),
  execute: async ({ key }) => {
    if (!has(key)) {
      return `Sorry, "${key}" is not in our cake menu.`;
    }
    const value = get(key);
    return `${key}: ${value}`;
  },
});

// Tool to list all available cakes
export const listAllCakesTool = tool({
  name: "list_all_cakes",
  description:
    "List all available cakes in the bakery menu. Use this when the customer wants to see what cakes are available.",
  parameters: z.object({}),
  execute: async () => {
    const cakes = getAll();
    if (cakes.length === 0) {
      return "No cakes are currently available in the menu.";
    }
    const cakeList = cakes
      .map((cake) => `- ${cake.cake_name}: ${cake.description}`)
      .join("\n");
    return `Available cakes:\n${cakeList}`;
  },
});

// Agent that uses the database lookup tools
export const dbLookupAgent = new Agent({
  name: "Cake Baker Assistant",
  instructions: `You are a friendly cake baker assistant at a bakery.
You help customers learn about the delicious cakes available for baking and ordering.

When a customer asks about a specific cake, use the cake_lookup tool to check whether the cake is available and get its description.
When a customer wants to see all available cakes, use the list_all_cakes tool.
Be enthusiastic about cakes and provide helpful baking suggestions.
If a cake isn't available, kindly suggest alternatives from the menu.`,
  tools: [cakeLookupTool, listAllCakesTool],
});

// Run the agent with a query
export async function runAgentDbLookup(query: string) {
  const result = await run(dbLookupAgent, query);
  return result.finalOutput;
}
