const colors = require("tailwindcss/colors");

module.exports = {
  purge: {
    enabled: true,
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      //...colors,
      current: "current",
      transparent: "transparent",
      black: colors.black,
      white: colors.white,
      gray: colors.blueGray,
      //indigo: colors.indigo,
      red: colors.rose,
      green: colors.emerald,
      blue: colors.blue
    },
  },
  variants: [
    "responsive",
    "group-hover",
    "focus-within",
    "first",
    "last",
    "odd",
    "even",
    "hover",
    "focus",
    "active",
    "visited",
    "disabled",
  ],
  plugins: [require("@tailwindcss/forms")],
};
