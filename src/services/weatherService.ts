export interface WeatherData {
  city: string;
  temperature: number; // in Celsius
  condition: string;
  windSpeed: number; // in m/s
  timestamp: string;
}

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "demo_key";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  try {
    if (API_KEY === "demo_key") {
      console.warn("Using mock weather data: No API key provided.");
      return getMockWeather(city);
    }

    const response = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`);
    if (!response.ok) {
      console.warn(`Weather API Error: ${response.status} ${response.statusText}. Using mock data fallback.`);
      return getMockWeather(city);
    }

    const data = await response.json();
    return {
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main, // "Rain", "Thunderstorm", "Clear", etc.
      windSpeed: data.wind.speed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return getMockWeather(city); // Fallback to mock on error
  }
};

const getMockWeather = (city: string): WeatherData => {
  // Return random data for demo purposes
  const conditions = ["Clear", "Rain", "Thunderstorm", "Clouds"];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  return {
    city,
    temperature: 30 + Math.random() * 12, // 30-42
    condition: randomCondition,
    windSpeed: 5 + Math.random() * 15, // 5-20
    timestamp: new Date().toISOString(),
  };
};