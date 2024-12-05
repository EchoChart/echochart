const tenantURLRegex = /^(?:https?:\/\/)?(?<tenantId>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;

export const useTenantStore = defineStore('tenant', () => {
    const tenantId = ref(
        _get(
            window.location.href.match(tenantURLRegex),
            'groups.tenantId',
            import.meta.env.Dev ? import.meta.env.VITE_TENANT : null
        )
    );

    return { tenantId };
});
