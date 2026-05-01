import { useEffect, useRef, useState } from 'react';
import type { Checklist, ChecklistItem, AppData } from '../types';
import { createItem } from '../storage';
import { Header } from './Header';

interface EditorProps {
  data: AppData;
  setData: (d: AppData) => void;
  listId: string;
  onBack: () => void;
}

export function Editor({ data, setData, listId, onBack }: EditorProps) {
  const list = data.lists.find((l) => l.id === listId);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

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

  const addItem = () => {
    const text = newItem.trim();
    if (!text) return;
    update({ ...list, items: [...list.items, createItem(text)] });
    setNewItem('');
  };

  const addHeader = () => {
    const header = createItem('', true);
    update({ ...list, items: [...list.items, header] });
    setEditingId(header.id);
  };

  const renameList = (name: string) => update({ ...list, name });

  const updateItem = (id: string, text: string) =>
    update({
      ...list,
      items: list.items.map((it) => (it.id === id ? { ...it, text } : it)),
    });

  const deleteItem = (id: string) => {
    if (editingId === id) setEditingId(null);
    update({ ...list, items: list.items.filter((it) => it.id !== id) });
  };

  const duplicateItem = (item: ChecklistItem, index: number) => {
    const copy = createItem(item.text, item.isHeader);
    const items = list.items.slice();
    items.splice(index + 1, 0, copy);
    update({ ...list, items });
    setEditingId(copy.id);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= list.items.length) return;
    const items = list.items.slice();
    [items[index], items[next]] = [items[next], items[index]];
    update({ ...list, items });
  };

  return (
    <>
      <Header title="Edit list" onBack={onBack} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-40">
        <label className="mt-3 block">
          <span className="text-sm font-medium text-ink-600 dark:text-ink-300">
            List name
          </span>
          <input
            type="text"
            value={list.name}
            onChange={(e) => renameList(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-800 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
            autoComplete="off"
          />
        </label>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          Items ({list.items.filter((i) => !i.isHeader).length})
        </h2>

        <ul className="mt-2 space-y-2">
          {list.items.map((item, i) => {
            const isEditing = editingId === item.id;
            const isHeader = !!item.isHeader;
            const placeholderText = isHeader ? 'Section name' : 'Empty';
            const displayLabel = item.text || placeholderText;
            return (
              <li
                key={item.id}
                className={`flex items-center gap-1 rounded-xl border p-1.5 ${
                  isHeader
                    ? 'border-ink-300 bg-ink-100 dark:border-ink-600 dark:bg-ink-700/60'
                    : 'border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800'
                }`}
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${displayLabel} up`}
                    className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-700"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === list.items.length - 1}
                    aria-label={`Move ${displayLabel} down`}
                    className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-700"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>

                {isEditing ? (
                  <>
                    <label className="sr-only" htmlFor={`item-${item.id}`}>
                      {isHeader ? 'Section name' : 'Item text'}
                    </label>
                    <input
                      ref={editInputRef}
                      id={`item-${item.id}`}
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          e.preventDefault();
                          setEditingId(null);
                        }
                      }}
                      placeholder={isHeader ? 'e.g. Bathroom' : ''}
                      className={`min-w-0 flex-1 rounded-lg border border-blue-500 bg-white px-2 py-2 text-base text-ink-800 dark:bg-ink-900 dark:text-ink-100 ${
                        isHeader ? 'font-semibold' : ''
                      }`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label={`Done editing ${displayLabel}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className={`min-w-0 flex-1 truncate rounded-lg px-2 py-2 text-left text-base hover:bg-ink-50 dark:hover:bg-ink-700 ${
                        isHeader
                          ? 'font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-200'
                          : 'text-ink-800 dark:text-ink-100'
                      }`}
                    >
                      {item.text || (
                        <span className="italic text-ink-400">
                          {placeholderText}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      aria-label={`Edit ${displayLabel}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-700"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateItem(item, i)}
                      aria-label={`Duplicate ${displayLabel}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-700"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Delete ${displayLabel}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {list.items.length === 0 && (
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
            No items yet. Add some below.
          </p>
        )}
      </main>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-ink-200 bg-ink-50/95 backdrop-blur dark:border-ink-700 dark:bg-ink-900/95">
        <div className="mx-auto max-w-2xl px-3 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}
            className="flex gap-2"
          >
            <label className="sr-only" htmlFor="add-item">
              Add item
            </label>
            <input
              id="add-item"
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add item — e.g. Passport"
              className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 py-3 text-base text-ink-800 placeholder:text-ink-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newItem.trim()}
              className="rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-40"
            >
              Add
            </button>
          </form>
          <button
            type="button"
            onClick={addHeader}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Add section header
          </button>
        </div>
      </div>
    </>
  );
}
