import { WeatherData } from "./weatherService";

export interface DisruptionTrigger {
  id: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  impact: string;
  timestamp: string;
  status: "active" | "monitoring" | "resolved";
  location: string;
  threshold: string;
  currentValue: string;
  affectedWorkers: number;
  icon: string;
  detectedAt: string;
}

export const generateTriggers = (weatherData: WeatherData): DisruptionTrigger[] => {
  const triggers: DisruptionTrigger[] = [];
  const { city, temperature, condition, windSpeed, timestamp } = weatherData;

  const dateStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Rule: Heavy Rain / Thunderstorm
  if (condition === "Rain" || condition === "Thunderstorm" || condition === "Drizzle") {
    triggers.push({
      id: `rain-${city}-${Date.now()}`,
      type: condition === "Thunderstorm" ? "Thunderstorm Detected" : "Rain Alert",
      severity: condition === "Thunderstorm" ? "High" : "Medium",
      impact: "Slippery roads, poor visibility, high risk of accidents",
      timestamp,
      status: "active",
      location: city,
      threshold: "Any rain",
      currentValue: condition,
      affectedWorkers: Math.floor(Math.random() * 50) + 120, // Example numbers
      icon: condition === "Thunderstorm" ? "⛈️" : "🌧️",
      detectedAt: dateStr,
    });
  }

  // Rule: Extreme Heat
  if (temperature > 38) {
    triggers.push({
      id: `heat-extreme-${city}-${Date.now()}`,
      type: "Extreme Heat",
      severity: "High",
      impact: "Heat exhaustion, severe vehicle overheating",
      timestamp,
      status: "active",
      location: city,
      threshold: ">38°C",
      currentValue: `${temperature.toFixed(1)}°C`,
      affectedWorkers: Math.floor(Math.random() * 100) + 200,
      icon: "🌡️",
      detectedAt: dateStr,
    });
  } else if (temperature > 30) {
    triggers.push({
      id: `heat-monitoring-${city}-${Date.now()}`,
      type: "High Heat Alert",
      severity: "Medium",
      impact: "Discomfort, mild dehydration risk",
      timestamp,
      status: "monitoring",
      location: city,
      threshold: ">30°C",
      currentValue: `${temperature.toFixed(1)}°C`,
      affectedWorkers: Math.floor(Math.random() * 50) + 80,
      icon: "☀️",
      detectedAt: dateStr,
    });
  }

  // Rule: Storm Alert
  if (windSpeed > 10) {
    triggers.push({
      id: `wind-${city}-${Date.now()}`,
      type: "High Wind Alert",
      severity: "High",
      impact: "Risk of accidents due to heavy winds",
      timestamp,
      status: "active",
      location: city,
      threshold: ">10 m/s",
      currentValue: `${windSpeed.toFixed(1)} m/s`,
      affectedWorkers: Math.floor(Math.random() * 40) + 50,
      icon: "💨",
      detectedAt: dateStr,
    });
  }

  return triggers;
};