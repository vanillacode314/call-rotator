// uno.config.ts
import { defineConfig, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    // presetWebFonts({
    //   extendTheme: true,
    //   fonts: {
    //     sans: "Inter:400,500,600,700,800,900",
    //   },
    // }),
    presetIcons({
      extraProperties: {
        color: "auto",
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
});
