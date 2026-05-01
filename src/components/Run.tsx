import { useState } from 'react';
import type { Checklist, AppData } from '../types';
import { resetChecks } from '../storage';
import {
  buildMailtoUrl,
  copyListToClipboard,
  exportListCSV,
  exportListJSON,
} from '../exportImport';
import { Header } from './Header';

interface RunProps {
  data: AppData;
  setData: (d: AppData) => void;
  listId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function Run({ data, setData, listId, onBack, onEdit }: RunProps) {
  const list = data.lists.find((l) => l.id === listId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!list) {
    return (
      <>
        <Header title="Not found" onBack={onBack} />
        <main className="mx-auto w-full max-w-2xl px-4 py-8">
          <p>That list no longer exists.</p>
        </main>
      </>
    );
  }

  const update = (next: Checklist) => {
    setData({
      ...data,
      lists: data.lists.map((l) =>
        l.id === next.id ? { ...next, updatedAt: Date.now() } : l
      ),
    });
  };

  const toggle = (id: string) =>
    update({
      ...list,
      items: list.items.map((it) =>
        it.id === id ? { ...it, checked: !it.checked } : it
      ),
    });

  const reset = () => {
    if (!confirm('Uncheck all items?')) return;
    update(resetChecks(list));
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const total = list.items.length;
  const done = list.items.filter((i) => i.checked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <>
      <Header
        title={list.name}
        onBack={onBack}
        right={
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More actions"
              className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg dark:border-ink-700 dark:bg-ink-800"
                >
                  <MenuItem
                    onClick={() => {
                      onEdit();
                      setMenuOpen(false);
                    }}
                  >
                    Edit list
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      reset();
                      setMenuOpen(false);
                    }}
                    disabled={done === 0}
                  >
                    Reset all checks
                  </MenuItem>
                  <div className="my-1 border-t border-ink-100 dark:border-ink-700" />
                  <MenuItem
                    onClick={async () => {
                      const ok = await copyListToClipboard(list);
                      flash(ok ? 'Copied to clipboard' : 'Copy failed');
                      setMenuOpen(false);
                    }}
                  >
                    Copy as text
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      window.location.href = buildMailtoUrl(list);
                      setMenuOpen(false);
                    }}
                  >
                    Email to myself
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      exportListJSON(list);
                      setMenuOpen(false);
                    }}
                  >
                    Download JSON
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      exportListCSV(list);
                      setMenuOpen(false);
                    }}
                  >
                    Download CSV
                  </MenuItem>
                </div>
              </>
            )}
          </div>
        }
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-12">
        {total > 0 && (
          <div className="mt-3" aria-hidden="true">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              {done} of {total} ({pct}%)
            </p>
          </div>
        )}

        {total === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink-200 p-6 text-center text-ink-500 dark:border-ink-700 dark:text-ink-400">
            <p>No items yet.</p>
            <button
              type="button"
              onClick={onEdit}
              className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Add items
            </button>
          </div>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {list.items.map((item) => (
              <li key={item.id}>
                <label
                  className={`flex cursor-pointer select-none items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-3 transition-colors dark:border-ink-700 dark:bg-ink-800 ${
                    item.checked
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggle(item.id)}
                    className="h-6 w-6 flex-none rounded-md border-ink-300 text-emerald-600 focus:ring-emerald-500 dark:border-ink-600"
                  />
                  <span
                    className={`flex-1 text-base ${
                      item.checked
                        ? 'text-ink-400 line-through dark:text-ink-500'
                        : 'text-ink-800 dark:text-ink-100'
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="safe-bottom fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
        >
          <span className="rounded-full bg-ink-800 px-4 py-2 text-sm text-white shadow-lg dark:bg-ink-100 dark:text-ink-900">
            {toast}
          </span>
        </div>
      )}
    </>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="block w-full px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-100 disabled:opacity-40 dark:text-ink-200 dark:hover:bg-ink-700"
    >
      {children}
    </button>
  );
}
