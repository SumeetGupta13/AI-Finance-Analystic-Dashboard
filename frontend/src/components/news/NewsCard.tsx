import { Newspaper } from 'lucide-react';
import type { NewsArticle, SentimentAnalysis } from '../../types/domain';
import Badge from '../ui/Badge';
import ScoreMeter from '../analytics/ScoreMeter';

type NewsCardProps = {
  article: NewsArticle;
  sentimentBySymbol: Map<string, SentimentAnalysis>;
};

const sentimentTone = {
  positive: 'success',
  neutral: 'warning',
  negative: 'danger',
} as const;

export default function NewsCard({ article, sentimentBySymbol }: NewsCardProps) {
  const confidence = article.confidence ?? Math.round(Math.abs(article.sentimentScore || 0) * 100);
  const positive = article.sentiment === 'positive';
  const negative = article.sentiment === 'negative';

  return (
    <article className={positive ? 'rounded-lg border border-emerald-300/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl' : negative ? 'rounded-lg border border-rose-300/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl' : 'rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl'}>
      <div className="flex items-start justify-between gap-4">
        <div className={positive ? 'flex size-11 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300' : negative ? 'flex size-11 items-center justify-center rounded-md bg-rose-300/10 text-rose-300' : 'flex size-11 items-center justify-center rounded-md bg-amber-300/10 text-amber-200'}>
          <Newspaper size={20} />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={sentimentTone[article.sentiment]}>{article.sentiment}</Badge>
          <Badge tone="indigo">{confidence}% confidence</Badge>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="neutral">{article.category}</Badge>
        {article.symbols.map((symbol) => {
          const symbolSentiment = sentimentBySymbol.get(symbol);
          const tone =
            symbolSentiment?.sentiment === 'Positive'
              ? 'success'
              : symbolSentiment?.sentiment === 'Negative'
                ? 'danger'
                : 'warning';

          return (
            <Badge key={symbol} tone={tone}>
              {symbol}
            </Badge>
          );
        })}
      </div>
      <h2 className="mt-5 text-xl font-semibold leading-7">{article.title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/58">{article.summary}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/42">
        <span>{article.source}</span>
        <span>{new Date(article.publishedAt).toLocaleString()}</span>
      </div>
      <ScoreMeter
        value={confidence}
        label="Sentiment confidence"
        tone={negative ? 'danger' : positive ? 'success' : 'indigo'}
        className="mt-5"
      />
    </article>
  );
}
