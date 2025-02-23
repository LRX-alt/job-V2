import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Archivio from '@/views/Archivio.vue';
import ReportDashboard from '@/views/ReportDashboard.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/archivio', component: Archivio },
  { path: '/report', component: ReportDashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
