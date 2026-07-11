export default function LoadingCompetitor() {
  return (
    <div className="space-y-4 py-20 animate-pulse">
      <div className="h-10 rounded-2xl bg-base-border" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-base-border" />
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-base-border" />
          <div className="h-24 rounded-2xl bg-base-border" />
          <div className="h-24 rounded-2xl bg-base-border" />
        </div>
      </div>
    </div>
  );
}
