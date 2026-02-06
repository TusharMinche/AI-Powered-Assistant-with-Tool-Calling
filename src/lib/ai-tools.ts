import { z } from "zod";
import { tool } from "ai";

// Weather Tool - Uses OpenWeatherMap API
export const weatherTool = tool({
    description: "Get the current weather for a specific location",
    parameters: z.object({
        location: z.string().describe("The city name, e.g. London, New York"),
    }),
    execute: async ({ location }: { location: string }) => {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            return {
                location: data.name,
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main,
                humidity: data.main.humidity,
            };
        } catch (e) {
            return { location, temperature: 0, condition: "Unknown Location", humidity: 0 };
        }
    },
});

// Stock Tool - Uses Alpha Vantage API
export const stockTool = tool({
    description: "Get the current stock price for a symbol",
    parameters: z.object({
        symbol: z.string().describe("The stock symbol, e.g. AAPL, MSFT, IBM"),
    }),
    execute: async ({ symbol }: { symbol: string }) => {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        try {
            const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
            );
            const data = await response.json();
            const quote = data["Global Quote"];
            if (!quote || !quote["05. price"]) throw new Error("No Quote");
            return {
                symbol: quote["01. symbol"],
                price: parseFloat(quote["05. price"]).toFixed(2),
                change: quote["10. change percent"],
            };
        } catch (e) {
            return { symbol: symbol.toUpperCase(), price: 0, change: "N/A" };
        }
    },
});


// F1 Tool - Uses OpenF1 API (free, no API key required)
export const f1Tool = tool({
    description: "Get the next upcoming Formula 1 race",
    parameters: z.object({
        query: z.string().describe("A query about F1, e.g. next race"),
    }),
    execute: async () => {
        try {
            // Get current year dynamically
            const currentYear = new Date().getFullYear();

            // Fetch F1 calendar from OpenF1 API for current year
            const response = await fetch(`https://api.openf1.org/v1/meetings?year=${currentYear}`);
            if (!response.ok) throw new Error("Failed to fetch F1 data");

            const meetings = await response.json();
            const now = new Date();

            // Find the next upcoming race
            const nextRace = meetings.find((meeting: any) => {
                const raceEnd = new Date(meeting.date_end);
                return raceEnd > now;
            });

            if (!nextRace) {
                return {
                    raceName: "Season Complete",
                    circuit: `${currentYear} F1 Season has ended`,
                    date: `Check back for ${currentYear + 1} calendar`,
                    time: "N/A",
                };
            }

            // Format the date nicely
            const raceStart = new Date(nextRace.date_start);
            const raceEnd = new Date(nextRace.date_end);
            const dateOptions: Intl.DateTimeFormatOptions = {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            };
            const formattedDate = `${raceStart.toLocaleDateString('en-US', dateOptions)} - ${raceEnd.toLocaleDateString('en-US', dateOptions)}`;

            return {
                raceName: nextRace.meeting_name,
                circuit: `${nextRace.circuit_short_name}, ${nextRace.location}`,
                date: formattedDate,
                time: nextRace.country_name,
            };
        } catch (e) {
            console.error("F1 API Error:", e);
            return {
                raceName: "Unknown Race",
                circuit: "API Error",
                date: "N/A",
                time: "N/A",
            };
        }
    },
});
