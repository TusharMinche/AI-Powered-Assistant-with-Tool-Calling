import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { weatherTool, stockTool, f1Tool } from "@/lib/ai-tools";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { messages } = await req.json();

        const result = streamText({
            model: groq("llama-3.3-70b-versatile"),
            messages,
            tools: {
                getWeather: weatherTool,
                getStockPrice: stockTool,
                getF1Matches: f1Tool,
            },
            maxSteps: 5,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}
