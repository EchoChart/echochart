import Collection from '@/lib/Collection';
import { ColumnProps, DataTableProps } from 'primevue';
import { MenuItem } from 'primevue/menuitem';

export {};

declare global {
   type CustomTableProps = {
      rowActions: MenuItem[];
      columns: ColumnProps[] & { sortOrder: { value: Number } }[];
      mapClass: InstanceType<typeof Collection>;
   } & DataTableProps;
}
