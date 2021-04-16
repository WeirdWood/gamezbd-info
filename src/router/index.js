import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/timer"
  },
  {
    path: "/fs-calculator",
    name: "Enhance Calculator",
    component: () => import("../views/EnhanceCalculator.vue"),
  },
  {
    path: "/timer",
    name: "Timer",
    component: () => import("../views/Timer.vue"),
  },
  {
    path: "/info",
    name: "Info",
    component: () => import("../views/Info.vue"),
  },
  {
    path: "/market-calculator",
    name: "Market Calculator",
    component: () => import("../views/MarketCalculator.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
