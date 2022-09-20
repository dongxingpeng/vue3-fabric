const path = require("path");
const resolve = (url:string)=> path.resolve(__dirname,`../${url}`);
export default{
  "@": resolve("src"),
  "components": resolve("src/components"),
  "views": resolve("src/views"),
  "hooks": resolve("src/hooks"),
  "route": resolve("src/route"),
  "types": resolve("src/types"),
  "vue": "vue/dist/vue.esm-bundler.js"
};