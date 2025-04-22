export async function getWeather(city: string) {
  const apiKey = process.env.WEATHER_API;
  const baseUrl = 'http://api.weatherapi.com/v1/current.json';

  try {
    const url = `${baseUrl}?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather for ${city}`);
    }

    const data = await response.json();
    return {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
    };
  } catch (error) {
    if (error instanceof Error) {
      const newError = new Error(error.message);
      newError.stack = error.stack;
      throw newError;
    } else {
      console.error(error);
      throw new Error(`Could not fetch weather data for ${city}.`);
    }
  }
}
