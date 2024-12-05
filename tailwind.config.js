/** @type {import('tailwindcss').Config} */
import primeUIPlugin from 'tailwindcss-primeui';
export default {
    darkMode: ['selector', '[color-scheme*="dark"]'],
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [
        primeUIPlugin,
        function ({ addBase, theme }) {
            function extractColorVars(colorObj, colorGroup = '') {
                return Object.keys(colorObj).reduce((vars, colorKey) => {
                    const value = colorObj[colorKey];
                    const newVars =
                        typeof value === 'string'
                            ? { [`--p${colorGroup}-${colorKey}`]: value }
                            : extractColorVars(value, `-${colorKey}`);

                    return { ...vars, ...newVars };
                }, {});
            }

            addBase({
                ':root': extractColorVars(theme('colors'))
            });
        }
    ],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                soho: {
                    0: '#ffffff',
                    50: '#f4f4f4',
                    100: '#e8e9e9',
                    200: '#d2d2d4',
                    300: '#bbbcbe',
                    400: '#a5a5a9',
                    500: '#8e8f93',
                    600: '#77787d',
                    700: '#616268',
                    800: '#4a4b52',
                    900: '#34343d',
                    950: '#1d1e27'
                },
                viva: {
                    0: '#ffffff',
                    50: '#f3f3f3',
                    100: '#e7e7e8',
                    200: '#cfd0d0',
                    300: '#b7b8b9',
                    400: '#9fa1a1',
                    500: '#87898a',
                    600: '#6e7173',
                    700: '#565a5b',
                    800: '#3e4244',
                    900: '#262b2c',
                    950: '#0e1315'
                },
                ocean: {
                    0: '#ffffff',
                    50: '#fbfcfc',
                    100: '#F7F9F8',
                    200: '#EFF3F2',
                    300: '#DADEDD',
                    400: '#B1B7B6',
                    500: '#828787',
                    600: '#5F7274',
                    700: '#415B61',
                    800: '#29444E',
                    900: '#183240',
                    950: '#0c1920'
                }
            }
        }
    }
};
