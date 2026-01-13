/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#0b0b0f", card: "#12121a", ink: "#eaeaf2", mute: "#8b8b98" }
    }
  },
  plugins: []
};
