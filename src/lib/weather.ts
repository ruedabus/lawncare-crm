/**
 * Weather helper using Open-Meteo (free, no API key required).
 * https://open-meteo.com/en/docs
 *
 * Fetches a 7-day daily + hourly forecast for a lat/lon and returns
 * per-day flag decisions for lawn-care-relevant bad weather.
 */

export type WeatherCondition =
  | "rain"
  | "thunderstorm"
  | "high_winds"
  | "extreme_heat";

export type DayForecast = {
  date: string; // YYYY-MM-DD
  flagged: boolean;
  conditions: WeatherCondition[];
  summary: string; // human-readable, e.g. "Rain (65%), Thunderstorm"
  maxTemp: number; // °F
  maxWindMph: number;
  precipProbability: number; // 0–100
  weatherCode: number; // WMO code
};

// WMO weather interpretation codes — thunderstorm range
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

const KMH_TO_MPH = 0.621371;
const C_TO_F = (c: number) => c * 1.8 + 32;

// Thresholds
const RAIN_PCT_THRESHOLD = 40; // precipitation_probability_max %
const WIND_MPH_THRESHOLD = 25; // wind_speed_10m_max mph
const HEAT_F_THRESHOLD = 100; // temperature_2m_max °F

/**
 * Fetch a multi-day forecast for the given coordinates.
 * Returns one DayForecast per day, sorted by date.
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  days = 4
): Promise<DayForecast[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: String(days),
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    // Next.js cache: revalidate every hour so we don't hammer the API
    next: { revalidate: 3600 },
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`);
  }

  const data = await res.json();
  const daily = data.daily as {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };

  return daily.time.map((date, i) => {
    const wCode = daily.weather_code[i] ?? 0;
    const tempF = C_TO_F(daily.temperature_2m_max[i] ?? 0);
    const precipPct = daily.precipitation_probability_max[i] ?? 0;
    const windMph = (daily.wind_speed_10m_max[i] ?? 0) * KMH_TO_MPH;

    const conditions: WeatherCondition[] = [];

    if (THUNDERSTORM_CODES.has(wCode)) conditions.push("thunderstorm");
    else if (precipPct >= RAIN_PCT_THRESHOLD) conditions.push("rain");

    if (windMph >= WIND_MPH_THRESHOLD) conditions.push("high_winds");
    if (tempF >= HEAT_F_THRESHOLD) conditions.push("extreme_heat");

    const flagged = conditions.length > 0;

    const parts: string[] = [];
    if (conditions.includes("thunderstorm")) parts.push("Thunderstorm");
    else if (conditions.includes("rain")) parts.push(`Rain (${precipPct}%)`);
    if (conditions.includes("high_winds")) parts.push(`High winds (${Math.round(windMph)} mph)`);
    if (conditions.includes("extreme_heat")) parts.push(`Extreme heat (${Math.round(tempF)}°F)`);

    return {
      date,
      flagged,
      conditions,
      summary: parts.join(", ") || "Clear",
      maxTemp: Math.round(tempF),
      maxWindMph: Math.round(windMph),
      precipProbability: precipPct,
      weatherCode: wCode,
    };
  });
}

/** Look up a single day's forecast from a cached result set */
export function forecastForDate(
  forecasts: DayForecast[],
  date: string
): DayForecast | undefined {
  return forecasts.find((f) => f.date === date);
}
