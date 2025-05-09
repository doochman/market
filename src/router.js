import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import SubmitAsset from './views/SubmitAsset.vue';
import AssetDetail from './views/AssetDetail.vue';
import Profile from './views/Profile.vue';
import { getAuth } from 'firebase/auth';

const routes = [
  { path: '/', component: Home },
  {
    path: '/submit',
    component: SubmitAsset,
    meta: { requiresAuth: true },
  },
  { path: '/asset/:id', component: AssetDetail },
  { path: '/profile/:userId', component: Profile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.meta.requiresAuth && !user) {
    next('/');
  } else {
    next();
  }
});

export default router;