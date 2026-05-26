import { useEffect, useMemo, useState } from 'react';
import { RadioTower, Search } from 'lucide-react';
import ScoreMeter from '../components/analytics/ScoreMeter';
import NewsCard from '../components/news/NewsCard';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { marketService } from '../services/marketService';
import type { NewsArticle, SentimentAnalysis } from '../types/domain';

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sentiment, setSentiment] = useState<SentimentAnalysis[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNews() {
      setLoading(true);
      try {
        const [articleData, sentimentData] = await Promise.all([
          marketService.getMarketNews(),
          marketService.getSentimentAnalysis(),
        ]);

        if (active) {
          setArticles(articleData);
          setSentiment(sentimentData);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNews();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(articles.map((article) => article.category)))].map((value) => ({ value, label: value })),
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory = category === 'All' || article.category === category;
      const matchesSearch =
        !searchValue ||
        article.title.toLowerCase().includes(searchValue) ||
        article.summary.toLowerCase().includes(searchValue) ||
        article.source.toLowerCase().includes(searchValue) ||
        article.symbols.some((symbol) => symbol.toLowerCase().includes(searchValue));

      return matchesCategory && matchesSearch;
    });
  }, [articles, category, search]);

  const sentimentBySymbol = useMemo(() => new Map(sentiment.map((item) => [item.symbol, item])), [sentiment]);
  const sentimentDistribution = useMemo(() => {
    const total = articles.length || 1;
    const positive = articles.filter((article) => article.sentiment === 'positive').length;
    const negative = articles.filter((article) => article.sentiment === 'negative').length;
    const neutral = articles.filter((article) => article.sentiment === 'neutral').length;

    return [
      { label: 'Positive', value: Math.round((positive / total) * 100), tone: 'success' as const },
      { label: 'Negative', value: Math.round((negative / total) * 100), tone: 'danger' as const },
      { label: 'Neutral', value: Math.round((neutral / total) * 100), tone: 'warning' as const },
    ];
  }, [articles]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">News</p>
          <h1 className="mt-3 text-4xl font-semibold">News sentiment</h1>
          <p className="mt-2 max-w-3xl text-white/56">
            Categorized market headlines with symbol-level sentiment, confidence scores, and positive or negative signal coloring.
          </p>
        </div>
        <Tabs tabs={categories} value={category} onChange={setCategory} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardContent>
            <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3">
              <Search size={18} className="text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/36"
                placeholder="Search by headline, source, or symbol"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-3 gap-3">
            {sentimentDistribution.map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-black/20 p-3 text-center">
                <Badge tone={item.tone}>{item.label}</Badge>
                <p className="mt-3 text-2xl font-semibold">{item.value}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} sentimentBySymbol={sentimentBySymbol} />
          ))}
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Symbol sentiment</CardTitle>
            <RadioTower size={18} className="text-emerald-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentiment.map((item) => (
                <div key={item.symbol} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.symbol}</p>
                      <p className="text-xs text-white/42">{item.assetType}</p>
                    </div>
                    <Badge tone={item.sentiment === 'Positive' ? 'success' : item.sentiment === 'Negative' ? 'danger' : 'warning'}>
                      {item.sentiment}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/56">{item.reason}</p>
                  <ScoreMeter
                    value={item.confidence}
                    label={`${item.label} confidence`}
                    tone={item.sentiment === 'Negative' ? 'danger' : item.sentiment === 'Positive' ? 'success' : 'indigo'}
                    className="mt-4"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
