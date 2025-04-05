const colors = require('tailwindcss/colors')

module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors:{
                pastelPurple: {
                    50: "#f9f6ff",
                    100: "#f4edff",
                    200: "#e9dbff",
                    300: "#ddc9ff",
                    400: "#d2b7ff",
                    500: "#c7a5ff",
                    600: "#9f84cc",
                    700: "#776399",
                    800: "#504266",
                    900: "#282133"
                },
            },
        },
    },
    plugins: [],
};