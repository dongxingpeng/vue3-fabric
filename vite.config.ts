import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createHtmlPlugin } from "vite-plugin-html";
import alias from "./config";

export default ({ mode }) => {
  return defineConfig({
    base: mode === "development" ? "./" : "/",
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias,
    },
    plugins: [
      vueJsx(),
      vue(),
      createHtmlPlugin({
        minify: true,
        entry: "/src/main.ts",
        template: "index.html",
        inject: {
          data: {
            title: loadEnv(mode, process.cwd()).VITE_APP_TITLE,
          },
        },
      }),
    ],

    server: {
      port: 8089,
      open: true,
    },
  });
};
