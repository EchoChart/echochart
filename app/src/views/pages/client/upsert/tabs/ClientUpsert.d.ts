export {};

declare global {
   type ClientUpsertFormData = {} & Tables['client']['Row'] & {
         address?: Tables['address']['Row'][];
      };
}
