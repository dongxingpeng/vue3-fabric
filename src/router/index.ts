import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// 主组件
const Index = () => import("@/views/Index.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Index,
  },
];
const router = createRouter({
  history: createWebHistory("/"),
  routes,
});
export default router;
