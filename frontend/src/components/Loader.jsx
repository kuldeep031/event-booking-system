export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/15 border-t-ink" />
      {label}
    </div>
  );
}
