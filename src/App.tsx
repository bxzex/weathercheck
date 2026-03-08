import React, { useState, useEffect } from 'react';

const API_KEY = "07cfb742fc9e45f6bf891642260803";
const BASE_URL = "https://api.weatherapi.com/v1";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

export default function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (city: string) => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no`
      );
      if (!response.ok) throw new Error('Location not found');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Could not find weather for that location.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('New York');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(query);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Weather</h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Precision Forecasts Worldwide</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-[400px] group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city or region..."
              className="w-full bg-slate-900/40 border border-slate-800/60 rounded-3xl py-4 px-8 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder-slate-600 text-white shadow-2xl backdrop-blur-sm"
            />
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl text-sm mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : weather && (
          <div className="space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-4">
            {/* Main Weather Card */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl shadow-indigo-950/40 relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] group-hover:bg-white/10 transition-all duration-1000"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{weather.location.name}</h2>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                          {weather.location.country}
                        </span>
                        <span className="text-indigo-100/60 font-medium">{weather.location.region}</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xl font-bold tracking-tight">{new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-indigo-100/70 font-semibold mt-1">{new Date(weather.location.localtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="mt-20 md:mt-32 flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="flex items-center gap-10">
                      <div className="relative">
                        <span className="text-[10rem] md:text-[13rem] font-black tracking-tighter leading-none block">
                          {Math.round(weather.current.temp_c)}°
                        </span>
                      </div>
                      <div>
                        <p className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-2 uppercase">{weather.current.condition.text}</p>
                        <div className="flex items-center gap-2 text-indigo-100/80 font-bold uppercase tracking-widest text-sm">
                          <span>Feels Like</span>
                          <span className="text-white text-lg">{Math.round(weather.current.feelslike_c)}°</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 bg-black/20 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-inner">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-2">Wind</p>
                        <p className="text-xl font-black">{Math.round(weather.current.wind_kph)}<span className="text-xs ml-1 opacity-50">K/H</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-2">Humidity</p>
                        <p className="text-xl font-black">{weather.current.humidity}<span className="text-xs ml-1 opacity-50">%</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-2">UV</p>
                        <p className="text-xl font-black">{weather.current.uv}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar / Forecast */}
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">5-Day Forecast</h3>
                  </div>
                  <div className="space-y-8">
                    {weather.forecast?.forecastday.map((day, i) => (
                      <div key={i} className="flex items-center justify-between group transition-all">
                        <div className="w-24">
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                            {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <img 
                            src={day.day.condition.icon} 
                            alt={day.day.condition.text} 
                            className="w-10 h-10 grayscale brightness-[2] opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                          />
                        </div>
                        <div className="text-right w-24">
                          <span className="font-black text-white text-lg">{Math.round(day.day.maxtemp_c)}°</span>
                          <span className="ml-3 text-slate-600 font-bold">{Math.round(day.day.mintemp_c)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-12 pt-10 border-t border-slate-800/60">
                  <div className="bg-indigo-500/5 rounded-3xl p-6 border border-indigo-500/10 transition-colors hover:bg-indigo-500/10">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Atmosphere</p>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                      "Currently experiencing {weather.current.condition.text.toLowerCase()} skies with moderate visibility in {weather.location.name}."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="flex flex-col items-center text-center">
          <div className="text-[12px] text-slate-600 font-black tracking-[0.4em] uppercase mb-10">
            developed by <a href="https://github.com/bxzex" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-white transition-all underline decoration-indigo-500/30 underline-offset-8 decoration-2">bxzex</a>
          </div>
          
          <div className="flex gap-12 mb-16">
            <a href="https://github.com/bxzex" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-white transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="https://linkedin.com/in/bxzex/" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#0077b5] transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://instagram.com/bxzex" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#e4405f] transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-800 font-bold tracking-[0.2em] uppercase">
            <span>Open Source</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span>MIT License</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
