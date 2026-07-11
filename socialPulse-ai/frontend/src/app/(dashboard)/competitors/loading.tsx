export default function LoadingCompetitors() {
  return (
    <div className="space-y-4 py-20 animate-pulse">
      <div className="h-10 rounded-2xl bg-base-border" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-28 rounded-2xl bg-base-border" />
        <div className="h-28 rounded-2xl bg-base-border" />
        <div className="h-28 rounded-2xl bg-base-border" />
        <div className="h-28 rounded-2xl bg-base-border" />
      </div>
      <div className="h-80 rounded-3xl bg-base-border" />
    </div>
  );
}
