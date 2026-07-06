import { useNavigate } from 'react-router-dom';
import { useCreateRestaurant } from '../hooks/useDiaryData';

export function PublicPlaceCard({ place }) {
  const navigate = useNavigate();
  const createRestaurant = useCreateRestaurant();

  async function handleAddToDiary() {
    const restaurant = await createRestaurant.mutateAsync({
      name: place.name,
      address: place.address,
      barangay: place.barangay,
      city: place.city,
      province: place.province,
      category: place.category,
      latitude: place.latitude,
      longitude: place.longitude
    });
    navigate(`/restaurants/${restaurant.id}`);
  }

  return (
    <div className="restaurant-card public-place-card">
      <div className="restaurant-card__header">
        <h3>{place.name}</h3>
        {place.category && <span className="badge">{place.category.replace('_', ' ')}</span>}
      </div>

      {place.address && <p className="restaurant-card__address">{place.address}</p>}

      <button
        type="button"
        className="button-ghost"
        onClick={handleAddToDiary}
        disabled={createRestaurant.isPending}
      >
        {createRestaurant.isPending ? 'Adding...' : '+ Add to my diary'}
      </button>
    </div>
  );
}
