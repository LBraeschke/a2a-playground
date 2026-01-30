import express from "express";
import { agentCardHandler, restHandler, UserBuilder } from "@a2a-js/sdk/server/express";
import { agentCardPath, createRequestHandler } from "./agent-route.ts";

// 1. Set up the server.
const requestHandler = createRequestHandler();

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(`/${agentCardPath}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use(
  "/a2a/rest",
  restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }),
);

app.use((req, res) => {
  res.status(404).json({ method: req.method, path: req.path });
});

app.listen(4000, () => {
  console.log(`🚀 Server started on http://localhost:4000`);
});
