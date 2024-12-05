import { appFirestore } from '@/plugins/firebase';
// const { tenantId } = useTenant();

// const tenantDbPath = computed(() => {
//     return tenantId.value ? doc(appFirestore, `tenants/${tenantId.value}`).path : '/';
// });

// const withTenant = (referencer, path, converter = Collection, callback, ...filters) => {
//     watchEffect(async (onClean) => {
//         const unsub = onSnapshot(
//             query(
//                 referencer(appFirestore, tenantDbPath.value, path).withConverter(converter),
//                 ...filters
//             ),
//             callback
//         );

//         onClean(unsub);
//     });
// };

export default () => {
    return {
        db: appFirestore
        // tenantDbPath,
        // tenantId,
        // withTenant
    };
};
