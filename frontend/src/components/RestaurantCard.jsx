import { Link } from 'react-router-dom';

export function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-card__header">
        <h3>{restaurant.name}</h3>
        {restaurant.category && <span className="badge">{restaurant.category}</span>}
      </div>

      {restaurant.address && <p className="restaurant-card__address">{restaurant.address}</p>}
      {(restaurant.barangay || restaurant.city || restaurant.province) && (
        <p className="restaurant-card__location">
          {[restaurant.barangay, restaurant.city, restaurant.province].filter(Boolean).join(', ')}
        </p>
      )}

      <div className="restaurant-card__meta">
        <span>{restaurant.visitCount} visit{restaurant.visitCount === 1 ? '' : 's'}</span>
        {restaurant.averageRating != null && (
          <span className="rating">★ {restaurant.averageRating.toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}
