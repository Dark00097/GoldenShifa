import Link from 'next/link';

export function EmptyState({
  title,
  text,
  actionHref,
  actionLabel
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="surface p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-deepHoney">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">{text}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
