export function UsageMeter({ label, current, max }: { label: string; current: number | string; max: number | string }) {
  return <div>{label}: {current}/{max}</div>;
}