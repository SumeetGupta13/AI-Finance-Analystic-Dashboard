import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Newspaper, Sparkles, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DUMMY_NEWS = [
  { id: '1', symbol: 'AAPL', headline: 'Apple integrates generative AI into Wallet for smarter spending alerts', summary: 'The product team says the new feature will bring personalized finance insights to iPhone users.', source: 'Bloomberg', publishedAt: '2026-05-20T08:30:00Z', sentiment: 'Positive', score: 0.72 },
  { id: '2', symbol: 'TSLA', headline: 'Tesla delays Cybertruck deliveries after supply chain disruption', summary: 'Investors are watching closely as production risks pile up ahead of the summer quarter.', source: 'Reuters', publishedAt: '2026-05-19T14:10:00Z', sentiment: 'Negative', score: -0.48 },
  { id: '3', symbol: 'MSFT', headline: 'Microsoft expands cloud AI partnerships with new enterprise tools', summary: 'The updated roadmap emphasizes industry-specific AI services and stronger security controls.', source: 'CNBC', publishedAt: '2026-05-18T10:00:00Z', sentiment: 'Positive', score: 0.65 },
  { id: '4', symbol: 'GME', headline: 'Short interest spikes again despite muted retail trading volume', summary: 'Analysts say the meme stock remains volatile and difficult to value in current conditions.', source: 'The Street', publishedAt: '2026-05-17T16:45:00Z', sentiment: 'Neutral', score: 0.02 },
  { id: '5', symbol: 'NVDA', headline: 'Nvidia reports better-than-expected data center revenue for Q2', summary: 'AI chip demand keeps the momentum alive, even as PC shipments soften.', source: 'MarketWatch', publishedAt: '2026-05-16T09:20:00Z', sentiment: 'Positive', score: 0.81 },
  { id: '6', symbol: 'AMZN', headline: 'Amazon cuts workforce in logistics division to streamline costs', summary: 'The company expects savings to improve margins ahead of the holiday selling season.', source: 'Reuters', publishedAt: '2026-05-15T11:55:00Z', sentiment: 'Negative', score: -0.34 },
];

const sentimentLabel = (v) => v >= 0.25 ? 'Positive' : v <= -0.25 ? 'Negative' : 'Neutral';
const fmt = (iso) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));

const sentimentVariant = { Positive: 'success', Negative: 'danger', Neutral: 'muted' };

const NewsSentiment = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [filter, setFilter] = useState('all');
  const [newsData, setNewsData] = useState(DUMMY_NEWS);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => newsData.filter(n => {
    const sym = searchSymbol.trim().toLowerCase();
    return (!sym || n.symbol.toLowerCase().includes(sym)) &&
           (filter === 'all' || n.sentiment.toLowerCase() === filter);
  }), [newsData, searchSymbol, filter]);

  const counts = useMemo(() => {
    const c = { Positive: 0, Negative: 0, Neutral: 0 };
    newsData.forEach(n => c[n.sentiment]++);
    return c;
  }, [newsData]);

  const positivity = Math.round((counts.Positive / (newsData.length || 1)) * 100);

  const trending = useMemo(() => {
    const map = {};
    newsData.forEach(n => {
      if (!map[n.symbol]) map[n.symbol] = { count: 0, total: 0 };
      map[n.symbol].count++;
      map[n.symbol].total += n.score;
    });
    return Object.entries(map)
      .map(([sym, s]) => ({ symbol: sym, mentions: s.count, score: s.total / s.count }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  }, [newsData]);

  const summary = useMemo(() => {
    if (counts.Positive > counts.Negative + 1) return 'The market shows stronger positive momentum across news coverage, with AI and cloud names leading sentiment.';
    if (counts.Negative > counts.Positive + 1) return 'Negative headlines are dominating investor attention, suggesting a cautious stance for near-term positioning.';
    return 'The market is balanced today, with mixed headlines across tech and retail names. Watch for directional catalysts.';
  }, [counts]);

  const searchNews = async () => {
    const sym = searchSymbol.trim();
    if (!sym) { setNewsData(DUMMY_NEWS); return; }
    setLoading(true);
    try {
      const res = await api.get(`/ai/news/${sym}`);
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setNewsData(res.data.data.map(n => ({
          id: n._id || n.id || `${n.symbol}-${n.publishedAt}`,
          symbol: n.symbol, headline: n.headline || n.title || 'Market update',
          summary: n.summary || n.description || '', source: n.source || 'Unknown',
          publishedAt: n.publishedAt, sentiment: sentimentLabel(n.sentimentScore ?? 0), score: n.sentimentScore ?? 0,
        })));
      } else {
        toast('No news found, showing sample data', { icon: 'ℹ️' });
        setNewsData(DUMMY_NEWS);
      }
    } catch {
      toast.error('Unable to fetch news. Showing demo data.');
      setNewsData(DUMMY_NEWS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" /> News Sentiment
          </h1>
          <p className="text-sm text-muted mt-1">Monitor sentiment, trending names and AI-driven market pulse.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            placeholder="Search symbol, e.g. AAPL"
            className="flex-1 sm:w-48 h-10 px-4 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchSymbol}
            onChange={e => setSearchSymbol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchNews()}
          />
          <Button onClick={searchNews} isLoading={loading} size="md">
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* News Feed */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filter Bar */}
          <Card hover={false}>
            <CardContent className="p-4 flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">Filter:</span>
              {['all', 'positive', 'neutral', 'negative'].map(opt => (
                <Button
                  key={opt}
                  variant={filter === opt ? 'primary' : 'secondary'}
                  size="xs"
                  onClick={() => setFilter(opt)}
                >
                  {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* News Cards */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted">No headlines match your filter.</CardContent></Card>
            ) : (
              filtered.map((news, i) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-foreground bg-background border border-border px-2 py-0.5 rounded-lg">{news.symbol}</span>
                            <Badge variant={sentimentVariant[news.sentiment]}>{news.sentiment}</Badge>
                          </div>
                          <h3 className="text-sm font-bold text-foreground leading-snug">{news.headline}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-muted">{news.source}</p>
                          <p className="text-xs text-muted mt-1">{fmt(news.publishedAt)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted mt-3 leading-relaxed">{news.summary}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-lg bg-background border border-border text-muted font-medium">
                          Score: {news.score.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4">
          {/* Sentiment Meter */}
          <Card>
            <CardHeader><CardTitle>Sentiment Meter</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted">Positive coverage</p>
                  <h2 className="text-4xl font-bold text-foreground mt-1">{positivity}%</h2>
                </div>
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={12} data={[{ name: 'P', value: positivity, fill: '#10B981' }]} startAngle={180} endAngle={-180}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-success/10 py-2.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Positive</p>
                  <p className="text-lg font-bold text-success">{counts.Positive}</p>
                </div>
                <div className="rounded-xl bg-danger/10 py-2.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Negative</p>
                  <p className="text-lg font-bold text-danger">{counts.Negative}</p>
                </div>
                <div className="rounded-xl bg-border/40 py-2.5">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Neutral</p>
                  <p className="text-lg font-bold text-foreground">{counts.Neutral}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Stocks */}
          <Card>
            <CardHeader><CardTitle>Trending Stocks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {trending.map((stock, i) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
                      <p className="text-xs text-muted">{stock.mentions} mentions</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${stock.score > 0 ? 'text-success' : stock.score < 0 ? 'text-danger' : 'text-muted'}`}>
                    {stock.score > 0 ? <ArrowUpRight className="w-4 h-4" /> : stock.score < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    {Math.abs(stock.score).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <CardTitle className="text-primary">AI Market Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-7">{summary}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewsSentiment;
