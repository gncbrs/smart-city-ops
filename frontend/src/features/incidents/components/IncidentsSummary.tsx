interface IncidentsSummaryProps
{
    count: number;
}

export function IncidentsSummary ({count} : IncidentsSummaryProps)
{
    return <p>
        Total Count of Incidents: {count}
    </p>
}
