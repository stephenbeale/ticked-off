import type { Checklist, AppData } from './types';

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'list';
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportListJSON(list: Checklist): void {
  const blob = new Blob([JSON.stringify(list, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `${safeFilename(list.name)}.tickedoff.json`);
}

export function exportAllJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, 'tickedoff-backup.json');
}

export function exportListCSV(list: Checklist): void {
  const escape = (s: string): string =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const rows = [
    ['item', 'checked'],
    ...list.items.map((it) => [escape(it.text), it.checked ? '1' : '0']),
  ];
  const csv = rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${safeFilename(list.name)}.csv`);
}

export function listToPlainText(list: Checklist): string {
  const lines = list.items.map(
    (it) => `${it.checked ? '[x]' : '[ ]'} ${it.text}`
  );
  return `${list.name}\n${'='.repeat(list.name.length)}\n\n${lines.join('\n')}`;
}

export function buildMailtoUrl(list: Checklist): string {
  const subject = `Ticked Off — ${list.name}`;
  const body = listToPlainText(list);
  return `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export async function copyListToClipboard(list: Checklist): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(listToPlainText(list));
    return true;
  } catch {
    return false;
  }
}

export interface ImportResult {
  ok: boolean;
  imported: number;
  error?: string;
}

export function importFromJSON(
  text: string,
  current: AppData
): { data: AppData; result: ImportResult } {
  try {
    const parsed = JSON.parse(text) as unknown;
    const incoming: Checklist[] = [];
    if (parsed && typeof parsed === 'object') {
      if (
        'version' in parsed &&
        'lists' in parsed &&
        Array.isArray((parsed as AppData).lists)
      ) {
        incoming.push(...(parsed as AppData).lists);
      } else if ('items' in parsed && 'name' in parsed) {
        incoming.push(parsed as Checklist);
      }
    }
    if (incoming.length === 0) {
      return {
        data: current,
        result: { ok: false, imported: 0, error: 'No lists found in file' },
      };
    }
    const existingIds = new Set(current.lists.map((l) => l.id));
    const merged: Checklist[] = [...current.lists];
    for (const list of incoming) {
      if (!list.id || existingIds.has(list.id)) {
        merged.push({
          ...list,
          id: `${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        });
      } else {
        merged.push(list);
      }
    }
    return {
      data: { version: 1, lists: merged },
      result: { ok: true, imported: incoming.length },
    };
  } catch (err) {
    return {
      data: current,
      result: {
        ok: false,
        imported: 0,
        error: err instanceof Error ? err.message : 'Invalid JSON',
      },
    };
  }
}
