/** @type {import('tailwindcss').Config} */
export default {
    important: '#root',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {},
    },
    plugins: [],
}
