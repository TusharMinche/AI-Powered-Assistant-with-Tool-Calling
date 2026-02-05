import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { auth } from "@/lib/auth";

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
            system: `You are a helpful AI assistant. You have access to the following tools:
    
1. **getWeather** - Get current weather for a location
2. **getF1Matches** - Get information about the next F1 race
3. **getStockPrice** - Get current stock price for a symbol

When users ask about weather, F1 races, or stock prices, use the appropriate tool to fetch real-time data.

Be concise, helpful, and friendly in your responses. Format your responses using markdown when appropriate.`,
            messages,
        });

        // Use textStream to create a simple text response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.textStream) {
                    // Format as SSE data
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}
