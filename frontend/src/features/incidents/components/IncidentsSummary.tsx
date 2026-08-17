interface IncidentsSummaryProps {
  count: number;
}

export function IncidentsSummary({ count }: IncidentsSummaryProps) {
  return <p>Active Incidents: {count}</p>;
}