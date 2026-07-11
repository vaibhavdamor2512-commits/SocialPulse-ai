export default function LoadingCampaign() {
  return (
    <div className="py-20 space-y-4 animate-pulse">
      <div className="h-10 rounded-2xl bg-base-border" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-base-border" />
        <div className="h-40 rounded-2xl bg-base-border" />
      </div>
    </div>
  );
}
