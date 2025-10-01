import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: { title: "鏟子英雄 2.0 - 救援對接媒合平台" },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/Admin.vue"),
    meta: { title: "管理後台", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // TODO: Implement auth check for requiresAuth routes
  if (to.meta.requiresAuth) {
    // For now, just proceed
    next();
  } else {
    next();
  }
});

export default router;
