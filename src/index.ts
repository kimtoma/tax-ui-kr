import { serve } from "bun";
import { getReturns, saveReturn, getApiKey, saveApiKey } from "./lib/storage";
import { parseTaxReturn } from "./lib/parser";
import index from "./index.html";

const server = serve({
  routes: {
    "/api/config": {
      GET: () => {
        const hasKey = Boolean(getApiKey());
        return Response.json({ hasKey });
      },
    },
    "/api/returns": {
      GET: async () => {
        return Response.json(await getReturns());
      },
    },
    "/api/parse": {
      POST: async (req) => {
        const formData = await req.formData();
        const file = formData.get("pdf") as File | null;
        const apiKeyFromForm = formData.get("apiKey") as string | null;

        if (!file) {
          return Response.json({ error: "No PDF file provided" }, { status: 400 });
        }

        const apiKey = apiKeyFromForm?.trim() || getApiKey();
        if (!apiKey) {
          return Response.json({ error: "No API key provided" }, { status: 400 });
        }

        // Save key to .env if provided via form
        if (apiKeyFromForm?.trim()) {
          await saveApiKey(apiKeyFromForm.trim());
        }

        try {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const taxReturn = await parseTaxReturn(base64, apiKey);
          await saveReturn(taxReturn);
          return Response.json(taxReturn);
        } catch (error) {
          console.error("Parse error:", error);
          const message = error instanceof Error ? error.message : "Unknown error";

          if (message.includes("authentication") || message.includes("API key")) {
            return Response.json({ error: "Invalid API key" }, { status: 401 });
          }
          if (message.includes("JSON")) {
            return Response.json({ error: "Failed to parse tax return data" }, { status: 422 });
          }
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
