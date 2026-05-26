import Skeleton from '../ui/Skeleton';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24" />
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-36" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
