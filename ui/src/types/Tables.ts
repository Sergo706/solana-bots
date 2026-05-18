
export interface SortingItem {
  id: string;
  desc: boolean;
}

export interface SortableColumn {
  getIsSorted: () => false | 'asc' | 'desc';
  clearSorting: () => void;
  toggleSorting: (desc?: boolean) => void;
}

export interface FilterableColumn {
  getFilterValue: () => unknown;
  setFilterValue: (value: string | undefined) => void;
}
export interface FilterableTableApi {
  getColumn: (id: string) => FilterableColumn | undefined;
}
