/** @type {import('tailwindcss').Config} */

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors:{
                pastelp: {
                    50: "#f9f6ff",
                    100: "#f4edff",
                    200: "#e9dbff",
                    300: "#ddc9ff",
                    400: "#d2b7ff",
                    500: "#c7a5ff",
                    600: "#9f84cc",
                    700: "#776399",
                    800: "#504266",
                    900: "#282133",
                },
                myColor: {
                    "50": "#f0fef8",
                    "100": "#e1fcf1",
                    "200": "#c3f9e4",
                    "300": "#a6f7d6",
                    "400": "#88f4c9",
                    "500": "#6af1bb",
                    "600": "#55c196",
                    "700": "#409170",
                    "800": "#2a604b",
                    "900": "#153025"
                }
            },
        },
    },
    plugins: [],
};