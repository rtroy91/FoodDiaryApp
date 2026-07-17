export function categoryLabel(category, fallback = "Other") {
  return category ? category.replace(/_/g, " ") : fallback;
}

export function buildPlaceStats(restaurants = [], entries = []) {
  const byId = new Map();

  restaurants.forEach((restaurant) => {
    byId.set(restaurant.id, {
      ...restaurant,
      visitCount: 0,
      ratingTotal: 0,
      averageRating: null,
    });
  });

  entries.forEach((entry) => {
    const restaurant = entry.restaurant;
    const id = restaurant?.id;
    if (!id) return;

    const current = byId.get(id) ?? {
      ...restaurant,
      id,
      name: restaurant?.name ?? "Unknown place",
      visitCount: 0,
      ratingTotal: 0,
      averageRating: null,
    };

    current.visitCount += 1;
    current.ratingTotal += entry.rating ?? 0;
    current.averageRating = current.ratingTotal / current.visitCount;
    byId.set(id, current);
  });

  return [...byId.values()].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
}
