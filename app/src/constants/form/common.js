import { countries } from 'countries-list';

export const currencies = [
   ...new Set(_values(countries).flatMap(({ currency }) => currency)).values()
];
