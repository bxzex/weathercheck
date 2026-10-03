import React, { useState, useEffect } from 'react';

// Open-Meteo: free, no key. Geocoding first, then forecast in the place's own timezone.
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WX_URL = 'https://api.open-meteo.com/v1/forecast';

interface Place {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface Forecast {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[] };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

// WMO weather interpretation codes
const describe = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return code >= 65 ? 'Heavy rain' : 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};

const time = (iso: string) => iso.slice(11, 16);
const weekday = (iso: string, i: number) =>
  i === 0 ? 'Today' : new Date(iso + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

export default function App() {
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [wx, setWx] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const t = (c: number) => Math.round(unit === 'C' ? c : c * 9 / 5 + 32) + '°';

  const load = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const g = await fetch(`${GEO_URL}?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`).then(r => r.json());
      const p: Place | undefined = g.results?.[0];
      if (!p) throw new Error(`No place called "${city.trim()}" found.`);
      const params = new URLSearchParams({
        latitude: String(p.latitude),
        longitude: String(p.longitude),
        timezone: 'auto',
        forecast_days: '7',
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
        hourly: 'temperature_2m,precipitation_probability',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,uv_index_max,sunrise,sunset',
      });
      const r = await fetch(`${WX_URL}?${params}`);
      if (!r.ok) throw new Error('The forecast service did not answer. Try again in a minute.');
      setWx(await r.json());
      setPlace(p);
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith('No place') ? e.message : 'Could not load the forecast. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('New York'); }, []);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); load(query); };

  // next 12 hours from the current local hour
  const start = wx ? Math.max(0, wx.hourly.time.findIndex(h => h >= wx.current.time.slice(0, 13))) : 0;
  const hours = wx ? wx.hourly.time.slice(start, start + 12).map((h, i) => ({
    h, temp: wx.hourly.temperature_2m[start + i], pop: wx.hourly.precipitation_probability[start + i],
  })) : [];
  const lo = wx ? Math.min(...wx.daily.temperature_2m_min) : 0;
  const hi = wx ? Math.max(...wx.daily.temperature_2m_max) : 1;
  const pos = (v: number) => (v - lo) / (hi - lo || 1) * 100;

  return (
    <div className="min-h-screen text-[#1d2329]">
      <header className="border-b border-[#d9d5cc] bg-white">
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 className="text-xl font-bold tracking-tight">Weathercheck</h1>
          <form onSubmit={onSubmit} className="flex flex-1 min-w-[200px] max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City or town"
              aria-label="City or town"
              className="flex-1 min-w-0 border border-[#bfb9ad] border-r-0 rounded-l px-3 py-1.5 focus:outline-none focus:border-[#1f5f9e]"
            />
            <button type="submit" className="bg-[#1f5f9e] hover:bg-[#184c80] text-white px-4 rounded-r font-bold text-sm">Search</button>
          </form>
          <div className="flex text-sm border border-[#bfb9ad] rounded overflow-hidden" role="group" aria-label="Units">
            {(['C', 'F'] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u}
                className={`px-3 py-1 ${unit === u ? 'bg-[#1d2329] text-white' : 'bg-white hover:bg-[#f3f1ec]'}`}>°{u}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {error && <p role="alert" className="border-l-4 border-[#b3412e] bg-white px-4 py-3 text-sm mb-6">{error}</p>}
        {loading && !wx && <p className="text-[#6b6a64] py-20 text-center">Loading forecast…</p>}

        {wx && place && (
          <div className={loading ? 'opacity-50 transition-opacity' : ''}>
            <section className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-[#d9d5cc]">
              <div>
                <h2 className="text-3xl font-bold">{place.name}</h2>
                <p className="text-[#6b6a64]">{[place.admin1, place.country].filter(Boolean).join(', ')} · local time {time(wx.current.time)}</p>
                <p className="mt-4 flex items-baseline gap-4">
                  <span className="text-7xl font-bold leading-none">{t(wx.current.temperature_2m)}</span>
                  <span className="text-xl">{describe(wx.current.weather_code)}<br />
                    <span className="text-base text-[#6b6a64]">feels like {t(wx.current.apparent_temperature)}</span></span>
                </p>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                <div><dt className="text-[#6b6a64]">Wind</dt><dd className="font-bold">{Math.round(wx.current.wind_speed_10m)} km/h</dd></div>
                <div><dt className="text-[#6b6a64]">Humidity</dt><dd className="font-bold">{wx.current.relative_humidity_2m}%</dd></div>
                <div><dt className="text-[#6b6a64]">Precipitation</dt><dd className="font-bold">{wx.current.precipitation} mm</dd></div>
                <div><dt className="text-[#6b6a64]">UV today</dt><dd className="font-bold">{Math.round(wx.daily.uv_index_max[0])}</dd></div>
                <div><dt className="text-[#6b6a64]">Sunrise</dt><dd className="font-bold">{time(wx.daily.sunrise[0])}</dd></div>
                <div><dt className="text-[#6b6a64]">Sunset</dt><dd className="font-bold">{time(wx.daily.sunset[0])}</dd></div>
              </dl>
            </section>

            <section className="py-6 border-b border-[#d9d5cc]">
              <h3 className="font-bold mb-3">Next 12 hours <span className="font-normal text-sm text-[#6b6a64]">· chance of rain</span></h3>
              <ol className="grid grid-cols-6 md:grid-cols-12 text-center text-sm gap-y-4">
                {hours.map(x => (
                  <li key={x.h}>
                    <div className="text-[#6b6a64]">{time(x.h)}</div>
                    <div className="font-bold text-base">{t(x.temp)}</div>
                    <div className={x.pop >= 30 ? 'text-[#1f5f9e]' : 'text-[#a19d93]'}>{x.pop}%</div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="py-6">
              <h3 className="font-bold mb-2">7 days</h3>
              <ul>
                {wx.daily.time.map((d, i) => {
                  const mn = wx.daily.temperature_2m_min[i], mx = wx.daily.temperature_2m_max[i];
                  const pop = wx.daily.precipitation_probability_max[i];
                  return (
                    <li key={d} className="grid grid-cols-[4.5rem_1fr_2.5rem] sm:grid-cols-[7rem_9rem_1fr_3rem] items-center gap-x-4 py-2 border-t border-[#e6e2d9] text-sm">
                      <span className="font-bold">{weekday(d, i)}</span>
                      <span className="hidden sm:block">{describe(wx.daily.weather_code[i])}</span>
                      <span className="flex items-center gap-3">
                        <span className="w-9 text-right text-[#6b6a64]">{t(mn)}</span>
                        <span className="relative flex-1 h-1.5 bg-[#e6e2d9] rounded">
                          <span className="absolute h-full rounded bg-gradient-to-r from-[#5b8fc4] to-[#d9822b]"
                            style={{ left: `${pos(mn)}%`, right: `${100 - pos(mx)}%` }} />
                        </span>
                        <span className="w-9 font-bold">{t(mx)}</span>
                      </span>
                      <span className={`text-right ${pop >= 30 ? 'text-[#1f5f9e]' : 'text-[#a19d93]'}`}>{pop}%</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-5 py-6 border-t border-[#d9d5cc] text-xs text-[#6b6a64] flex flex-wrap gap-x-4 gap-y-1">
        <span>© 2026 <a href="https://bxzex.com" target="_blank" rel="noopener noreferrer" className="underline">bxzex</a></span>
        <span>Forecast data from <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo</a> (CC BY 4.0)</span>
        <a href="https://github.com/bxzex/weathercheck" target="_blank" rel="noopener noreferrer" className="underline">Source on GitHub</a>
        <a href="https://buy.stripe.com/9B6eVfd9E6OC3sr7cEaAw03" target="_blank" rel="noopener noreferrer" className="underline">Support the project</a>
      </footer>
    </div>
  );
}
