/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,tsx,ts,jsx}", "./components/**/*.{js,tsx,ts,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        space: ["SpaceMono"],
        "space-italic": ["SpaceMonoItalic"],
        "space-bold": ["SpaceMonoBold"],
        "space-bolditalic": ["SpaceMonoBoldItalic"],
        pixel: ["PixelatedElegance"],
      },
    },
  },
  plugins: [],
};
