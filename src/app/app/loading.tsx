export default function AppLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading your wallet">
      <div className="space-y-2">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="skeleton h-7 w-56 rounded-lg" />
      </div>
      <div className="skeleton h-56 rounded-[1.75rem]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-44 rounded-3xl" />
        <div className="skeleton h-44 rounded-3xl" />
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-[5.5rem] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
