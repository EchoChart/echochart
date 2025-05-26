export {};

declare global {
   type ResourceTableProps = {
      from: string & keyof Tables;
      select: string;
   } & CustomTableProps;
}
