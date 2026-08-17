export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / 60000);

  if (totalMinutes < 1) {
    return "< 1 min";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;
}