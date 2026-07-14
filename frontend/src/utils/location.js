export function cleanLocationText(value) {
  return String(value ?? "").trim();
}

export function formatFoodPlaceLocation(foodPlace) {
  const barangay = cleanLocationText(foodPlace?.barangay);
  const city = cleanLocationText(foodPlace?.city);
  const province = cleanLocationText(foodPlace?.province);

  return [barangay ? `Brgy. ${barangay}` : null, city, province].filter(Boolean).join(", ");
}
