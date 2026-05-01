import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-10 border-b border-ink-200 bg-ink-50/90 backdrop-blur dark:border-ink-700 dark:bg-ink-900/90">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="-ml-1 grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Back"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="h-10 w-10" aria-hidden="true" />
        )}
        <h1 className="flex-1 truncate text-lg font-semibold text-ink-800 dark:text-ink-100">
          {title}
        </h1>
        {right}
      </div>
    </header>
  );
}
