/* =========================================================
   WEATHER CARD
   Source: Open-Meteo current weather API (no API key required)
   Location: Dibrugarh, Assam
   Refresh: every 30 minutes + when the page becomes visible
   ========================================================= */
(function () {
    "use strict";

    const WEATHER_URL =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=27.4728&longitude=94.9120" +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code" +
        "&daily=temperature_2m_max,temperature_2m_min" +
        "&forecast_days=1" +
        "&timezone=Asia%2FKolkata";

    const REFRESH_INTERVAL = 30 * 60 * 1000;
    let refreshTimer = null;
    let isLoading = false;
    let hasSuccessfulData = false;
    const WEATHER_CACHE_KEY = "ppuWeatherCache";

    const byId = (id) => document.getElementById(id);

function restoreCachedWeather() {
    try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!cached) return;

        const saved = JSON.parse(cached);

        if (!saved || !saved.temperature || !saved.condition) return;

        byId("weatherTemperature").textContent = saved.temperature;
        byId("weatherFeelsLike").textContent = saved.feelsLike;
        byId("weatherHumidity").textContent = saved.humidity;
        byId("weatherMaxMin").textContent = saved.maxMin;
        byId("weatherCondition").textContent = saved.condition;
        byId("weatherIcon").textContent = saved.icon;

        hasSuccessfulData = true;
    } catch (error) {
        console.warn("Could not restore cached weather:", error);
    }
}

    function conditionFor(code, isDay) {
        if (code === 0) return { text: isDay ? "Clear sky" : "Clear night", icon: isDay ? "☀️" : "🌙" };
        if (code === 1) return { text: isDay ? "Mainly clear" : "Mostly clear night", icon: isDay ? "🌤️" : "🌙" };
        if (code === 2) return { text: "Partly cloudy", icon: isDay ? "🌤️" : "☁️🌙" };
        if (code === 3) return { text: "Overcast", icon: "☁️" };
        if ([45, 48].includes(code)) return { text: "Foggy", icon: "🌫️" };
        if ([51, 53, 55, 56, 57].includes(code)) return { text: "Drizzle", icon: isDay ? "🌦️" : "🌧️" };
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: "Rain", icon: isDay ? "🌦️" : "🌧️" };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: "Snow", icon: "🌨️" };
        if ([95, 96, 99].includes(code)) return { text: "Thunderstorm", icon: "⛈️" };
        return { text: "Current conditions", icon: isDay ? "🌤️" : "🌙" };
    }

    function showUpdatedTime(date) {
        const element = byId("weatherUpdated");
        if (!element) return;
        element.textContent = "Updated " + date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    async function refreshWeather() {
        if (isLoading || document.visibilityState === "hidden") return;
        isLoading = true;

        try {
            const response = await fetch(WEATHER_URL, { cache: "no-store" });
            if (!response.ok) throw new Error("Weather request failed: " + response.status);

            const data = await response.json();
            const current = data && data.current;
            if (!current ||
                !Number.isFinite(Number(current.temperature_2m)) ||
                !Number.isFinite(Number(current.apparent_temperature)) ||
                !Number.isFinite(Number(current.relative_humidity_2m))) {
                throw new Error("Weather response did not contain all required values");
            }

            const isDay = Number(current.is_day) === 1;
            const condition = conditionFor(Number(current.weather_code), isDay);

            byId("weatherTemperature").textContent = `${Math.round(Number(current.temperature_2m))}°C`;
            byId("weatherFeelsLike").textContent = `${Math.round(Number(current.apparent_temperature))}°C`;
            byId("weatherHumidity").textContent = `${Math.round(Number(current.relative_humidity_2m))}%`;

            const daily = data.daily;
            if (
                daily &&
                daily.temperature_2m_max &&
                daily.temperature_2m_min &&
                daily.temperature_2m_max[0] != null &&
                daily.temperature_2m_min[0] != null
            ) {
                byId("weatherMaxMin").textContent =
                    `${Math.round(daily.temperature_2m_max[0])}°C / ${Math.round(daily.temperature_2m_min[0])}°C`;
            }
            byId("weatherCondition").textContent = condition.text;
            byId("weatherIcon").textContent = condition.icon;

try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        temperature: byId("weatherTemperature").textContent,
        feelsLike: byId("weatherFeelsLike").textContent,
        humidity: byId("weatherHumidity").textContent,
        maxMin: byId("weatherMaxMin").textContent,
        condition: byId("weatherCondition").textContent,
        icon: byId("weatherIcon").textContent
    }));
} catch (error) {
    console.warn("Could not save weather cache:", error);
}

            // The updated-time label is intentionally not displayed.
            hasSuccessfulData = true;
        } catch (error) {
            console.warn("Weather refresh failed:", error);
            // Preserve the last valid readings if a later refresh fails.
            if (!hasSuccessfulData) {
                byId("weatherCondition").textContent = "Weather unavailable";
                byId("weatherIcon").textContent = "🌡️";
        }
        } finally {
            isLoading = false;
        }
    }

function init() {
    if (!byId("weatherCard")) return;

    restoreCachedWeather();
    refreshWeather();

    refreshTimer = window.setInterval(refreshWeather, REFRESH_INTERVAL);

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") refreshWeather();
    });
}

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
