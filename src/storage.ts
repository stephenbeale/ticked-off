import type { Checklist, ChecklistItem, AppData } from './types';

const KEY = 'tickedoff:v1';

const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const empty = (): AppData => ({ version: 1, lists: [] });

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1 || !Array.isArray(parsed.lists)) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

export function save(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function createList(name: string): Checklist {
  const now = Date.now();
  return {
    id: uid(),
    name: name.trim() || 'Untitled list',
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createItem(text: string, isHeader = false): ChecklistItem {
  const item: ChecklistItem = { id: uid(), text: text.trim(), checked: false };
  if (isHeader) item.isHeader = true;
  return item;
}

export function duplicateList(list: Checklist, suffix = ' (copy)'): Checklist {
  const now = Date.now();
  return {
    id: uid(),
    name: `${list.name}${suffix}`,
    items: list.items.map((it) => ({ ...it, id: uid(), checked: false })),
    createdAt: now,
    updatedAt: now,
  };
}

export function resetChecks(list: Checklist): Checklist {
  return {
    ...list,
    items: list.items.map((it) => ({ ...it, checked: false })),
    updatedAt: Date.now(),
  };
}
