import { useEffect, useMemo, useState } from 'react';
import { Newspaper } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import { Card, CardContent } from '../components/ui/Card';
import { marketService } from '../services/marketService';
import type { NewsArticle } from '../types/domain';

const categories = ['All', 'Markets', 'US Stocks', 'Crypto', 'Funds', 'Macro'].map((value) => ({ value, label: value }));

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    void marketService.getMarketNews().then(setArticles);
  }, []);

  const filteredArticles = useMemo(() => {
    if (category === 'All') return articles;
    return articles.filter((article) => article.category === category);
  }, [articles, category]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">News</p>
          <h1 className="mt-3 text-4xl font-semibold">Market intelligence</h1>
          <p className="mt-2 text-white/56">Curated headlines from the mock news layer, ready for future provider integration.</p>
        </div>
        <Tabs tabs={categories} value={category} onChange={setCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
                  <Newspaper size={20} />
                </div>
                <Badge tone={article.sentiment === 'positive' ? 'success' : article.sentiment === 'negative' ? 'danger' : 'neutral'}>
                  {article.sentiment}
                </Badge>
              </div>
              <h2 className="mt-5 text-xl font-semibold leading-7">{article.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/58">{article.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/42">
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
                {article.symbols.map((symbol) => (
                  <Badge key={symbol} tone="indigo">{symbol}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
