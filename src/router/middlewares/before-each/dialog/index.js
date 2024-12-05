import { ProgressSpinner, useDialog } from 'primevue';

export const dialogBeforeEach = (to, from, next) => {
    const showDialog = to.query?.showDialog;
    if (!showDialog) {
        return next();
    }
    const { user } = storeToRefs(useAuthStore());

    const components = _last(to.matched).components;
    const dialogComponent = _isFunction(components.default)
        ? defineAsyncComponent({
              loader: components.default,
              loadingComponent: components.skeleton || ProgressSpinner
          })
        : components.default;

    const dialogs = useDialog();

    const onDragend = (e) => {
        const dialogElement = e?.target ?? e;
        if (!dialogElement) return;

        if (dialogElement.role != 'dialog') {
            return onDragend(dialogElement.parentElement);
        }

        dialog.options.props.style = dialogElement.style.cssText;
    };

    const onMouseenter = (e) => {
        const dialogElement = e?.target ?? e;
        if (!dialogElement) return;

        if (!dialogElement?.classList.contains('p-dialog-mask'))
            return onMouseenter(dialogElement.parentElement);

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
            keepInViewPort: false,
            closeOnEscape: false,
            onDragend,
            onMouseenter
        }
    };

    let dialog = dialogs.open(dialogComponent, dialogOptions);

    if (to.meta?.requiresAuth) {
        const unwatch = watch(
            () => user.value,
            (newUser) => {
                if (!newUser) return dialog.close();
                dialog = dialogs.open(dialogComponent, dialog.options);
            }
        );

        dialog.data.unwatch = unwatch;

        dialog.options.onClose ??= (options) => {
            const unwatch = _get(options, 'data.unwatch');
            unwatch?.();
        };

        dialog.options.props.closeButtonProps = {
            onClick: unwatch,
            severity: 'secondary',
            variant: 'text',
            rounded: true
        };
    }

    if (to.name == 'logout') {
        next({ name: 'login' });
        return;
    }

    if (from.matched?.length < 1) {
        const backRoute = to.matched
            .slice(0, -2)
            .reverse()
            .find((route) => route.name) || { name: 'dashboard' };
        next(backRoute);
    } else next(false);
};
