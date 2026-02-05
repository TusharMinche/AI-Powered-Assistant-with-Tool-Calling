"use client";

import { CloudSun, TrendingUp, Trophy, Wind, Droplets, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

// Weather Card - Blue gradient theme
export function WeatherCard({ data }: { data: WeatherData }) {
    if (!data || data.condition === "Unknown Location") return null;

    const getWeatherEmoji = (condition: string) => {
        const lower = condition.toLowerCase();
        if (lower.includes("clear") || lower.includes("sun")) return "☀️";
        if (lower.includes("cloud")) return "☁️";
        if (lower.includes("rain")) return "🌧️";
        if (lower.includes("snow")) return "❄️";
        if (lower.includes("smoke") || lower.includes("haze")) return "🌫️";
        if (lower.includes("storm") || lower.includes("thunder")) return "⛈️";
        return "🌤️";
    };

    return (
        <div className="w-72 mt-3 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <CloudSun className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-blue-400 font-medium text-sm">Weather in {data.location}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-white">{data.temperature}°C</div>
                        <div className="text-slate-400 text-sm mt-1">{data.condition}</div>
                    </div>
                    <div className="text-5xl">{getWeatherEmoji(data.condition)}</div>
                </div>

                <div className="flex gap-4 mt-4 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-300 text-sm">{data.humidity}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stock Card - Green/Red gradient theme based on change
export function StockCard({ data }: { data: StockData }) {
    if (!data || !data.price || data.price === 0 || data.price === "0") return null;

    const isPositive = !data.change.includes("-");
    const gradientClass = isPositive
        ? "from-green-600 via-green-500 to-emerald-400"
        : "from-red-600 via-red-500 to-rose-400";
    const shadowClass = isPositive ? "shadow-green-500/20" : "shadow-red-500/20";
    const textClass = isPositive ? "text-green-400" : "text-red-400";
    const bgClass = isPositive ? "bg-green-500/20" : "bg-red-500/20";

    return (
        <div className={`w-72 mt-3 rounded-2xl bg-gradient-to-br ${gradientClass} p-[1px] shadow-lg ${shadowClass}`}>
            <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 ${bgClass} rounded-lg`}>
                        <TrendingUp className={`h-5 w-5 ${textClass}`} />
                    </div>
                    <span className={`${textClass} font-medium text-sm`}>{data.symbol} Stock</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-4xl font-bold text-white">${data.price}</div>
                        <div className={`${textClass} text-sm font-semibold mt-1 flex items-center gap-1`}>
                            {isPositive ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4" />
                            )}
                            {data.change}
                        </div>
                    </div>
                    <div className="text-4xl">{isPositive ? "📈" : "📉"}</div>
                </div>
            </div>
        </div>
    );
}

// F1 Card - Red gradient theme
export function F1Card({ data }: { data: F1Data }) {
    if (!data || data.raceName === "Unknown Race" || data.circuit === "API Error") return null;

    const isSeasonEnd = data.raceName === "Season Complete" || data.raceName === "Season Finished";

    return (
        <div className="w-72 mt-3 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-400 p-[1px] shadow-lg shadow-red-500/20">
            <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="text-red-400 font-medium text-sm">
                        {isSeasonEnd ? "F1 Season Status" : "Next F1 Race"}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="text-xl font-bold text-white">{data.raceName}</div>
                        <div className="text-slate-400 text-sm mt-1">{data.circuit}</div>
                        {!isSeasonEnd && (
                            <div className="text-slate-500 text-xs mt-2">
                                📅 {data.date} • ⏰ {data.time}
                            </div>
                        )}
                    </div>
                    <div className="text-4xl">🏎️</div>
                </div>
            </div>
        </div>
    );
}
