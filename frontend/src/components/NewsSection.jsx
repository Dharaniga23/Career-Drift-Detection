import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, MessageSquare, RefreshCw, Zap } from 'lucide-react';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Expert': return 'bg-purple-900/40 text-purple-300 border-purple-700';
      case 'Update': return 'bg-emerald-900/40 text-emerald-300 border-emerald-700';
      default: return 'bg-blue-900/40 text-blue-300 border-blue-700';
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Expert': return <MessageSquare size={14} />;
      case 'Update': return <Zap size={14} />;
      default: return <Newspaper size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <p>Fetching latest tech updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl text-center">
        <p className="text-red-400 mb-2 font-semibold">Oops! Could not load news.</p>
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button 
          onClick={fetchNews}
          className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Newspaper className="text-blue-400" />
          Tech & Career News
        </h2>
        <button 
          onClick={fetchNews}
          className="text-slate-400 hover:text-white transition-colors"
          title="Refresh News"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item, idx) => (
          <div 
            key={idx} 
            className="group bg-slate-800/50 border border-slate-700 hover:border-slate-500 rounded-xl overflow-hidden transition-all duration-300 flex flex-col"
          >
            {item.urlToImage && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.urlToImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"; // Reliable fallback
                    }}
                  />
                  <div className="absolute top-4 left-4"></div> {/* This div was added by the instruction, but it's empty. Keeping it as per instruction. */}
                </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-3">
                 <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-grow">
                {item.description}
              </p>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500 italic font-medium">{item.source}</span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-xs font-bold transition-colors"
                >
                  Read More <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
