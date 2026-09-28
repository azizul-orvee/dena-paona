export function SectionHeading({
  title,
  caption,
  action,
}: {
  title: string;
  caption?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-600 tracking-tight">{title}</h2>
        {caption ? (
          <p className="mt-0.5 text-[0.8125rem] text-fg-subtle">{caption}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
