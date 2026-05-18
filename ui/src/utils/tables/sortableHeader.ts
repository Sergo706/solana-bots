/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SortableColumn } from "@/types/Tables";
import {h} from 'vue';


export function getSortableHeader(column: SortableColumn, label: string, components: { UButton: any; UDropdownMenu: any }) {
  const isSorted = column.getIsSorted();
  const { UButton, UDropdownMenu } = components;

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start'
      },

      'aria-label': `${label} sorting options`,

      items: [
        {
          label: 'Asc',
          type: 'checkbox' as const,
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',

          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting();
              return;
            }

            column.toggleSorting(false);
          }
        },

        {
          label: 'Desc',
          type: 'checkbox' as const,
          icon: 'i-lucide-arrow-down-wide-narrow',
          checked: isSorted === 'desc',

          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting();
              return;
            }

            column.toggleSorting(true);
          }
        }
      ]
    },

    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',

        class: '-mx-2.5 data-[state=open]:bg-elevated',

        'aria-label': `Sort ${label}`
      })
  );
}