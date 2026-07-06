import { usePublicPlaces } from '../hooks/usePublicPlaces';
import { PublicPlaceCard } from '../components/PublicPlaceCard';

export function DiscoverPage() {
  const { grouped, isLoading, isError } = usePublicPlaces();

  return (
    <div className="page">
      <h1>Discover places in Bataan</h1>
      <p className="page__subtitle">
        Public restaurants, fast food spots, and cafes pulled from OpenStreetMap. Add any of these to your diary in one tap.
      </p>

      {isLoading && <p>Loading places across Bataan...</p>}

      {isError && (
        <p className="form-error">
          Couldn't load places right now. OpenStreetMap's API can be slow or rate-limited — try again in a moment.
        </p>
      )}

      {!isLoading && !isError && !grouped && (
        <p className="empty-state">No public places found.</p>
      )}

      {grouped && Object.entries(grouped).map(([province, cities]) => (
        <section key={province} className="location-group">
          <h2>{province}</h2>

          {Object.entries(cities).map(([city, barangays]) => (
            <div key={city} className="location-group__city">
              <h3>{city}</h3>

              {Object.entries(barangays).map(([barangay, places]) => (
                <div key={barangay} className="location-group__barangay">
                  <h4>{barangay}</h4>
                  <div className="card-grid">
                    {places.map((place) => (
                      <PublicPlaceCard key={place.id} place={place} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
