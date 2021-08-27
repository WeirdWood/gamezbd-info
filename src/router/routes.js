const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", redirect: "/timer" },
      {
        path: "/fs-calculator",
        component: () => import("src/pages/EnhanceCalculator.vue"),
      },
      {
        path: "/market-calculator",
        component: () => import("pages/MarketCalculator.vue"),
      },
      { path: "/timer", component: () => import("pages/Timer.vue") },
      { path: "/info", component: () => import("pages/Info.vue") },
      { path: "/boss-timer", component: () => import("pages/BossTimer.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
