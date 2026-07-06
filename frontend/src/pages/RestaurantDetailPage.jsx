import { useParams } from 'react-router-dom';
import { useRestaurant, useEntries } from '../hooks/useDiaryData';
import { EntryForm } from '../components/EntryForm';
import { EntryList } from '../components/EntryList';

export function RestaurantDetailPage() {
  const { id } = useParams();
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurant(id);
  const { data: entries, isLoading: loadingEntries, refetch } = useEntries(id);

  if (loadingRestaurant) return <p className="page">Loading...</p>;
  if (!restaurant) return <p className="page">Restaurant not found.</p>;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>{restaurant.name}</h1>
          {restaurant.address && <p>{restaurant.address}</p>}
          {(restaurant.barangay || restaurant.city || restaurant.province) && (
            <p>{[restaurant.barangay, restaurant.city, restaurant.province].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="restaurant-card__meta">
          <span>{restaurant.visitCount} visit{restaurant.visitCount === 1 ? '' : 's'}</span>
          {restaurant.averageRating != null && (
            <span className="rating">★ {restaurant.averageRating.toFixed(1)} avg</span>
          )}
        </div>
      </header>

      <section>
        <h2>Log a new visit</h2>
        <EntryForm restaurantId={id} onSaved={refetch} />
      </section>

      <section>
        <h2>Past visits</h2>
        {loadingEntries ? <p>Loading...</p> : <EntryList entries={entries} />}
      </section>
    </div>
  );
}
