import { fetchWeather } from "./weatherService";
import { generateTriggers, DisruptionTrigger } from "./triggerService";
import { locations } from "../data/locations";

export interface IntegratedTrigger extends DisruptionTrigger {
  city: string;
  zone: string;
}

export const monitorAllLocations = async (): Promise<IntegratedTrigger[]> => {
  const weatherPromises = locations.map((loc) => fetchWeather(loc.city));
  const weatherResults = await Promise.all(weatherPromises);

  const allTriggers: IntegratedTrigger[] = [];

  weatherResults.forEach((weatherData) => {
    // Generate triggers for the entire city
    const cityTriggers = generateTriggers(weatherData);
    
    // Find the location object to pick a random zone if needed,
    // though typically the trigger might affect the whole city or specific zones.
    const locationInfo = locations.find((l) => l.city === weatherData.city);
    const zones = locationInfo?.zones || [];

    cityTriggers.forEach((trigger) => {
      // For demonstration, we'll assign a random zone from the city to represent isolated issues,
      // or "All Zones" if it's a general city alert.
      const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : "All Zones";
      
      allTriggers.push({
        ...trigger,
        city: weatherData.city, // Re-affirm city mapping explicitly
        zone, 
        location: `${weatherData.city} (${zone})`, // Enhance display location
      });
    });
  });

  return allTriggers;
};
