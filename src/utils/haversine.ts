/**
 * Calculates the distance between two points on the Earth's surface in meters
 * using the Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return parseFloat(distance.toFixed(2));
}

/**
 * Returns formatted location text and verification details
 */
export function verifyLocation(
  userLat: number,
  userLng: number,
  schoolLat: number,
  schoolLng: number,
  allowedRadius: number
): {
  distance: number;
  isValid: boolean;
  status: "VALID" | "DITOLAK";
  message: string;
} {
  const distance = calculateDistance(userLat, userLng, schoolLat, schoolLng);
  const isValid = distance <= allowedRadius;

  return {
    distance,
    isValid,
    status: isValid ? "VALID" : "DITOLAK",
    message: isValid
      ? `Berada dalam area sekolah (${distance.toFixed(1)}m dari sekolah)`
      : `Anda berada di luar area sekolah. Jarak Anda: ${distance.toFixed(1)}m, maksimal radius: ${allowedRadius}m.`,
  };
}
