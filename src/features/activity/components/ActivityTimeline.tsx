export function ActivityTimeline({ activities = [] }: { activities?: Record<string, unknown>[] }) {
  return <div className="activity-timeline">
    {activities.map((a: Record<string, unknown>) => <div key={a.id as string}>{a.description as string}</div>)}
  </div>;
}