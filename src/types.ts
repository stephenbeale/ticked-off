export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

export interface PacklistData {
  version: 1;
  lists: Checklist[];
}

export type View =
  | { name: 'home' }
  | { name: 'edit'; listId: string }
  | { name: 'run'; listId: string };
