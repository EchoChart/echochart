import { ProgressSpinner, useDialog } from 'primevue';

export const dialogBeforeEach = async (to, from, next) => {
   if (to.name == 'logout') {
      return next();
   }

   const showDialog = to.query?.showDialog;
   if (!showDialog) {
      return next();
   }

   const components = _last(to.matched).components;
   const dialogComponent = h(
      _isFunction(components.default)
         ? defineAsyncComponent({
              loader: components.default,
              loadingComponent: components.skeleton || ProgressSpinner
           })
         : components.default,
      to.params
   );

   const dialogs = useDialog();

   let dialog;

   const updateStyles = (e) => {
      const dialogElement = e?.target ?? e;
      if (!dialogElement) return;

      if (dialogElement.role != 'dialog') {
         return updateStyles(dialogElement.parentElement);
      }

      dialog.options.props.style = dialogElement.style.cssText;
   };

   const focusToDialog = (e) => {
      const dialogElement = e?.target || e;
      if (!dialogElement) return;

      if (!dialogElement?.classList.contains('p-dialog-mask')) {
         return focusToDialog(dialogElement.parentElement);
      }

      if (dialogElement.querySelectorAll('.p-dialog-maximized').length > 0) return;

      const allDialogElements = [
         ...document.querySelectorAll('.p-dialog-mask:has(.p-dialog[role="dialog"])')
      ];
      const topDialogElement = _last(
         allDialogElements.sort((a, b) => {
            return +a.style.zIndex - +b.style.zIndex;
         })
      );

      if (!topDialogElement || topDialogElement.isSameNode(dialogElement)) return;

      allDialogElements.forEach((element) => element.style.zIndex--);

      _set(dialogElement.style, 'zIndex', +topDialogElement.style.zIndex + 1);
   };

   const dialogOptions = {
      data: { to, from },
      props: {
         maximizable: true,
         header: _startCase(i18n.t(to.name)),
         position: showDialog,
         keepInViewport: false,
         closeOnEscape: true,
         class: 'max-w-full',
         onDragend: updateStyles,
         onMousedown: focusToDialog
      }
   };

   if (to.meta?.requiresAuth) {
      const authStore = useAuthStore();
      const { isSignedIn, currentTenant } = storeToRefs(authStore);

      await authStore.initialized;

      const tenantId = currentTenant.value?.id;

      const unwatch = watch(
         () => [currentTenant.value?.id, isSignedIn.value],
         async ([newTenantId, signedIn]) => {
            if (!signedIn) return dialog?.close?.();
            if (newTenantId !== tenantId && !_isNil(to.meta.requiredPermissions))
               return dialog?.close?.();
            dialog ??= dialogs.open(dialogComponent, dialogOptions);
         }
      );

      _set(dialogOptions, 'data.unwatch', unwatch);
      _set(dialogOptions, 'props.closeButtonProps', {
         onclick: unwatch,
         severity: 'secondary',
         rounded: true
      });

      dialogOptions.onClose = (options) => {
         dialog = null;
         if (options.type !== 'dialog-close') return;
         unwatch?.();
      };
   }

   dialog = dialogs.open(dialogComponent, dialogOptions);

   if (from.matched?.length < 1) {
      const backRoute = to.matched
         .slice(0, -2)
         .reverse()
         .find((route) => route.name) || { name: 'dashboard' };
      next(backRoute);
   } else next(false);
};
