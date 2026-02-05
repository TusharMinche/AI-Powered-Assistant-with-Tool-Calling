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
            return { symbol: symbol.toUpperCase(), price: 0, change: "N/A (Rate Limit or Invalid)" };
        }
    },
});

// F1 Tool - Uses Ergast Developer API (free)
export const f1Tool = tool({
    description: "Get the next upcoming Formula 1 race",
    parameters: z.object({
        query: z.string().describe("A query about F1, e.g. next race"),
    }),
    execute: async () => {
        try {
            const response = await fetch(`https://ergast.com/api/f1/current.json`);
            if (!response.ok) throw new Error("Failed to fetch F1 data");
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;

            if (!races || races.length === 0) {
                throw new Error("No races found");
            }

            const now = new Date();
            const nextRace = races.find((race: any) => {
                const raceDate = new Date(`${race.date}T${race.time || "00:00:00Z"}`);
                return raceDate > now;
            });

            if (!nextRace) {
                const lastRace = races[races.length - 1];
                return {
                    raceName: "Season Complete",
                    circuit: lastRace.Circuit.circuitName,
                    date: lastRace.date,
                    time: "N/A",
                };
            }

            return {
                raceName: nextRace.raceName,
                circuit: nextRace.Circuit.circuitName,
                date: nextRace.date,
                time: nextRace.time || "TBA",
            };
        } catch (e) {
            return {
                raceName: "Unknown Race",
                circuit: "API Error",
                date: "N/A",
                time: "N/A",
            };
        }
    },
});
