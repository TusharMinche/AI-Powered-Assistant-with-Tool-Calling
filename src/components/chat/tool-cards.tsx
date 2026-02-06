"use client";

interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
}

interface StockData {
    symbol: string;
    price: string | number;
    change: string;
}

interface F1Data {
    raceName: string;
    circuit: string;
    date: string;
    time: string;
}

// Weather Card - Dark theme
export function WeatherCard({ data }: { data: WeatherData }) {
    if (!data || data.condition === "Unknown Location") return null;

    return (
        <div className="mt-3 p-4 bg-neutral-800 border border-neutral-700 rounded-lg max-w-xs">
            <div className="flex items-center gap-2 text-sky-400 text-sm font-medium mb-2">
                ☀️ {data.location}
            </div>
            <div className="text-3xl font-bold text-neutral-100">{data.temperature}°C</div>
            <div className="text-neutral-400 text-sm mt-1">{data.condition}</div>
            <div className="text-neutral-500 text-xs mt-2">Humidity: {data.humidity}%</div>
        </div>
    );
}

// Stock Card - Dark theme
export function StockCard({ data }: { data: StockData }) {
    if (!data) return null;
    if (!data.price || data.price === 0 || data.price === "0" || data.price === "0.00") return null;

    const isPositive = !data.change.includes("-");

    return (
        <div className="mt-3 p-4 bg-neutral-800 border border-neutral-700 rounded-lg max-w-xs">
            <div className={`flex items-center gap-2 ${isPositive ? "text-green-400" : "text-red-400"} text-sm font-medium mb-2`}>
                📊 {data.symbol}
            </div>
            <div className="text-3xl font-bold text-neutral-100">${data.price}</div>
            <div className={`${isPositive ? "text-green-400" : "text-red-400"} text-sm font-medium mt-1`}>
                {isPositive ? "↑" : "↓"} {data.change}
            </div>
        </div>
    );
}

// F1 Card - Dark theme
export function F1Card({ data }: { data: F1Data }) {
    if (!data || data.raceName === "Unknown Race" || data.circuit === "API Error") return null;

    const isSeasonEnd = data.raceName === "Season Complete" || data.raceName === "Season Finished";

    return (
        <div className="mt-3 p-4 bg-neutral-800 border border-neutral-700 rounded-lg max-w-xs">
            <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-2">
                🏎️ {isSeasonEnd ? "Season" : "Next Race"}
            </div>
            <div className="text-xl font-bold text-neutral-100">{data.raceName}</div>
            <div className="text-neutral-400 text-sm mt-1">{data.circuit}</div>
            {!isSeasonEnd && (
                <div className="text-neutral-500 text-xs mt-2">
                    {data.date} • {data.time}
                </div>
            )}
        </div>
    );
}
