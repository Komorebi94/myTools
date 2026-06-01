import { createRouter, createWebHistory } from 'vue-router'
import { resolveAppBase } from '@/utils/resolveAppBase'
import { resolveRouteTitle, setPageTitle } from '@/utils/pageTitle'

const HappyNewYear = () => import('@/views/HappyNewYear/index.vue')
const Birthday = () => import('@/views/Birthday/index.vue')
const FitnessDiscipline = () => import('@/views/FitnessDiscipline/index.vue')
const LujxPlan = () => import('@/views/LujxPlan/index.vue')

const routes = [
	{
		path: '/',
		name: 'HappyNewYear',
		component: HappyNewYear
	},
	{
		path: '/birthday',
		name: 'Birthday',
		component: Birthday
	},
	{
		path: '/fitness',
		name: 'FitnessDiscipline',
		component: FitnessDiscipline
	},
	{
		path: '/lujx',
		name: 'LujxPlan',
		component: LujxPlan
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/'
	}
]

const router = createRouter({
	history: createWebHistory(resolveAppBase()),
	routes
})

router.beforeEach((to) => {
	if (to.path === '/' && to.query.page === 'birthday') {
		const query = { ...to.query }
		delete query.page
		return { path: '/birthday', query }
	}
	setPageTitle(resolveRouteTitle(to))
})

export default router
