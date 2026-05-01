import { useRef, useState } from 'react';
import type { Checklist, AppData } from '../types';
import { createList, duplicateList } from '../storage';
import { exportAllJSON, importFromJSON } from '../exportImport';
import { Header } from './Header';

interface HomeProps {
  data: AppData;
  setData: (d: AppData) => void;
  onOpenEdit: (id: string) => void;
  onOpenRun: (id: string) => void;
}

export function Home({ data, setData, onOpenEdit, onOpenRun }: HomeProps) {
  const [newName, setNewName] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const addList = () => {
    const name = newName.trim();
    if (!name) return;
    const list = createList(name);
    setData({ ...data, lists: [list, ...data.lists] });
    setNewName('');
    onOpenEdit(list.id);
  };

  const duplicate = (list: Checklist) => {
    const copy = duplicateList(list);
    setData({ ...data, lists: [copy, ...data.lists] });
  };

  const remove = (id: string) => {
    if (!confirm('Delete this list? This cannot be undone.')) return;
    setData({ ...data, lists: data.lists.filter((l) => l.id !== id) });
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const { data: next, result } = importFromJSON(text, data);
    if (result.ok) {
      setData(next);
      setImportMessage(`Imported ${result.imported} list(s).`);
    } else {
      setImportMessage(`Import failed: ${result.error ?? 'unknown error'}`);
    }
    setTimeout(() => setImportMessage(null), 4000);
  };

  return (
    <>
      <Header title="Ticked Off" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-24">
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addList();
          }}
        >
          <label className="sr-only" htmlFor="new-list">
            New list name
          </label>
          <input
            id="new-list"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New list name (e.g. Holiday packing)"
            className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-800 placeholder:text-ink-400 focus:border-blue-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-40"
          >
            Add
          </button>
        </form>

        {data.lists.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-ink-200 p-6 text-center text-ink-500 dark:border-ink-700 dark:text-ink-400">
            <p className="text-base">No lists yet.</p>
            <p className="mt-1 text-sm">
              Create a reusable checklist above — for example "Holiday packing"
              or "Leaving the house".
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.lists.map((list) => {
              const checkable = list.items.filter((i) => !i.isHeader);
              const total = checkable.length;
              const done = checkable.filter((i) => i.checked).length;
              return (
                <li
                  key={list.id}
                  className="rounded-2xl border border-ink-200 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-800"
                >
                  <button
                    type="button"
                    onClick={() => onOpenRun(list.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold text-ink-800 dark:text-ink-100">
                        {list.name}
                      </div>
                      <div className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">
                        {total === 0
                          ? 'Empty'
                          : `${done} / ${total} checked`}
                      </div>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden="true"
                      className="text-ink-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  <div className="flex items-center justify-end gap-1 border-t border-ink-100 px-2 py-1.5 dark:border-ink-700">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(list.id)}
                      className="rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(list)}
                      className="rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(list.id)}
                      className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-8" aria-labelledby="backup-heading">
          <h2
            id="backup-heading"
            className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400"
          >
            Backup
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportAllJSON(data)}
              disabled={data.lists.length === 0}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 disabled:opacity-40 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            >
              Download all (JSON)
            </button>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
            >
              Import JSON
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.target.value = '';
              }}
            />
          </div>
          {importMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mt-2 text-sm text-ink-600 dark:text-ink-300"
            >
              {importMessage}
            </p>
          )}
        </section>
      </main>
    </>
  );
}
