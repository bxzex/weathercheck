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
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Weather</h1>
            <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">Global Forecasts</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-[350px] group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl py-3.5 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all placeholder:text-slate-700 text-white shadow-xl backdrop-blur-sm"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24">
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
          <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Main Weather Card */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-all duration-1000"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl md:text-6xl font-black mb-3 tracking-tighter">{weather.location.name}</h2>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                          {weather.location.country}
                        </span>
                        <span className="text-indigo-100/60 text-sm font-bold">{weather.location.region}</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-black tracking-tight">{new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-indigo-100/70 font-bold mt-1 uppercase text-xs tracking-widest">{new Date(weather.location.localtime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="mt-16 md:mt-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="flex items-center gap-8">
                      <span className="text-9xl md:text-[11rem] font-black tracking-tighter leading-none block">
                        {Math.round(weather.current.temp_c)}°
                      </span>
                      <div>
                        <p className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-1 uppercase">{weather.current.condition.text}</p>
                        <p className="text-indigo-100/60 font-black uppercase tracking-widest text-[10px]">Feels Like {Math.round(weather.current.feelslike_c)}°</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-inner min-w-[300px]">
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-1">Wind</p>
                        <p className="text-lg font-black leading-none">{Math.round(weather.current.wind_kph)}<span className="text-[10px] ml-1 opacity-50">KPH</span></p>
                      </div>
                      <div className="text-center border-x border-white/5 px-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-1">Humidity</p>
                        <p className="text-lg font-black leading-none">{weather.current.humidity}<span className="text-[10px] ml-1 opacity-50">%</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-200/50 mb-1">UV</p>
                        <p className="text-lg font-black leading-none">{weather.current.uv}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar / Forecast */}
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl backdrop-blur-md">
                <div>
                  <h3 className="text-xl font-black text-white tracking-widest uppercase mb-10 pb-4 border-b border-white/5">Forecast</h3>
                  <div className="space-y-8">
                    {weather.forecast?.forecastday.map((day, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="w-20">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                            {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <img 
                            src={day.day.condition.icon} 
                            alt={day.day.condition.text} 
                            className="w-8 h-8 grayscale brightness-[2] opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                        <div className="text-right w-20">
                          <span className="font-black text-white">{Math.round(day.day.maxtemp_c)}°</span>
                          <span className="ml-2 text-slate-600 font-bold text-sm">{Math.round(day.day.mintemp_c)}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-800/60">
                  <div className="bg-indigo-500/5 rounded-2xl p-5 border border-indigo-500/10 transition-colors hover:bg-indigo-500/10">
                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Conditions</p>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed">
                      Skies are {weather.current.condition.text.toLowerCase()} in {weather.location.name} with a current temperature of {Math.round(weather.current.temp_c)}°C.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-900/50">
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-slate-600 font-black tracking-[0.4em] uppercase mb-8">
            developed by <a href="https://bxzex.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-white transition-all underline decoration-indigo-500/30 underline-offset-8 decoration-2">bxzex</a>
          </div>
          
          <div className="flex gap-10 mb-12">
            <a href="https://github.com/bxzex" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-white transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="https://linkedin.com/in/bxzex/" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#0077b5] transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://instagram.com/bxzex" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#e4405f] transition-all transform hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] text-slate-800 font-black tracking-[0.2em] uppercase">
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
