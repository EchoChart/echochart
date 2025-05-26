import { MenuItem } from 'primevue/menuitem';
import { RouterLinkProps } from 'vue-router';

export {};

declare global {
   type CustomLinkProps = {
      contextMenuItems: MenuItem[];
   } & RouterLinkProps;
}
