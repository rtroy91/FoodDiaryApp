import { useMostVisited } from '../hooks/useDiaryData';
import { RestaurantCard } from '../components/RestaurantCard';

export function MostVisitedPage() {
  const { data: restaurants, isLoading } = useMostVisited(10);

  return (
    <div className="page">
      <h1>Your most-visited spots</h1>

      {isLoading && <p>Loading...</p>}

      {!isLoading && !restaurants?.length && (
        <p className="empty-state">Log a few visits and your top spots will show up here.</p>
      )}

      <div className="card-grid">
        {restaurants?.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
      </div>
    </div>
  );
}
