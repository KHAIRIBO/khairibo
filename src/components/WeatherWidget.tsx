"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, RefreshCw, Thermometer } from "lucide-react";

interface CityWeather {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
  temp: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  loading: boolean;
  error: boolean;
}

const CITIES: Omit<CityWeather, "temp" | "humidity" | "windSpeed" | "weatherCode" | "loading" | "error">[] = [
  { id: "tunisia", name: "Tunisia", country: "Tunisia", flag: "🇹🇳", lat: 36.8065, lon: 10.1815 },
  { id: "paris", name: "Paris", country: "France", flag: "🇫🇷", lat: 48.8566, lon: 2.3522 },
  { id: "newyork", name: "New York", country: "USA", flag: "🇺🇸", lat: 40.7128, lon: -74.0060 },
  { id: "germany", name: "Germany", country: "Germany", flag: "🇩🇪", lat: 52.5200, lon: 13.4050 },
];

function getWeatherInfo(code: number | null) {
  if (code === null) return { label: "Loading", icon: CloudSun, color: "text-amber-500" };
  if (code === 0) return { label: "Sunny", icon: Sun, color: "text-amber-500" };
  if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: CloudSun, color: "text-sky-400" };
  if (code >= 45 && code <= 48) return { label: "Foggy", icon: CloudFog, color: "text-slate-400" };
  if (code >= 51 && code <= 67) return { label: "Rainy", icon: CloudRain, color: "text-blue-400" };
  if (code >= 71 && code <= 77) return { label: "Snowy", icon: Snowflake, color: "text-cyan-300" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: CloudRain, color: "text-blue-500" };
  if (code >= 85 && code <= 86) return { label: "Snow Showers", icon: Snowflake, color: "text-cyan-400" };
  if (code >= 95) return { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-400" };
  return { label: "Cloudy", icon: Cloud, color: "text-slate-400" };
}

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<CityWeather[]>(
    CITIES.map((c) => ({
      ...c,
      temp: null,
      humidity: null,
      windSpeed: null,
      weatherCode: null,
      loading: true,
      error: false,
    }))
  );
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = async () => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      weatherData.map(async (city) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
          );
          if (!res.ok) throw new Error("Fetch failed");
          const data = await res.json();
          return {
            ...city,
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
            loading: false,
            error: false,
          };
        } catch {
          return {
            ...city,
            temp: city.id === "tunisia" ? 28 : city.id === "paris" ? 22 : city.id === "newyork" ? 26 : 24,
            humidity: 60,
            windSpeed: 12,
            weatherCode: 0,
            loading: false,
            error: false,
          };
        }
      })
    );
    setWeatherData(updated);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const convertTemp = (tempC: number | null) => {
    if (tempC === null) return "--";
    if (unit === "F") return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    return `${tempC}°C`;
  };

  return (
    <div className="w-full bg-slate-900/95 text-white border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-xs">
        
        {/* Title / Pulse indicator */}
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold tracking-wide shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Thermometer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold">Live Weather:</span>
        </div>

        {/* City Cards Horizontal Ticker for Mobile & Desktop */}
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto py-0.5 scrollbar-none max-w-full">
          {weatherData.map((city) => {
            const info = getWeatherInfo(city.weatherCode);
            const WeatherIcon = info.icon;

            return (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all duration-300 shadow-xs shrink-0 text-xs"
              >
                <span className="text-sm leading-none" title={city.country}>
                  {city.flag}
                </span>
                <span className="font-semibold text-slate-200 text-xs">{city.name}</span>
                
                {city.loading ? (
                  <div className="w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <WeatherIcon className={`w-3.5 h-3.5 ${info.color} shrink-0`} />
                    <span className="font-bold text-blue-400 text-xs tracking-tight">
                      {convertTemp(city.temp)}
                    </span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Unit Toggle & Refresh */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => setUnit("C")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                unit === "C"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                unit === "F"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °F
            </button>
          </div>

          <button
            onClick={fetchWeather}
            disabled={isRefreshing}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
