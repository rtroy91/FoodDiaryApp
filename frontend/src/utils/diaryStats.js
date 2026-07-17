export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDiaryDate(date) {
  return date.toLocaleDateString("en-PH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function avg(values) {
  if (!values?.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function countUniqueVisitedPlaces(entries = []) {
  const ids = new Set();

  entries.forEach((entry) => {
    const restaurant = entry.restaurant;
    const key =
      restaurant?.id ??
      [restaurant?.name, restaurant?.barangay, restaurant?.city, restaurant?.province].filter(Boolean).join("|");

    if (key) ids.add(key);
  });

  return ids.size;
}

export function getDiaryStats(entries = []) {
  return {
    totalPlaces: countUniqueVisitedPlaces(entries),
    totalEntries: entries.length,
    avgRating: avg(entries.map((entry) => entry.rating)),
  };
}
