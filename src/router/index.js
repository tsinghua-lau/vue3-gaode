import {createWebHistory,createRouter,createWebHashHistory} from 'vue-router'

export const routerList=[
    {
        path:'/',
        name:'home',
        component:()=>import('../pages/Home2.vue')
    },
    {
        path:'/mymap',
        name:'mymap',
        component:()=>import('../pages/Home.vue')
    },{
        path:'/one',
        name:'one',
        component:()=>import('../pages/Home3.vue')
    }
]

const router=createRouter({
    history:createWebHashHistory(),
    routes:routerList
})

export default router