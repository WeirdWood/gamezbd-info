import { createRouter, createWebHistory } from "vue-router";
import Timer from "../views/Timer.vue";
import NotFound from "../views/NotFound.vue";

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
    component: Timer,
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
  {
    path: "/:catchAll(.*)",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
