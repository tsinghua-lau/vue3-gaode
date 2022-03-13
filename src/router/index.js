import {createWebHistory,createRouter} from 'vue-router'

export const routerList=[
    {
        path:'/'
        ,name:'home'
        ,component:()=>import('../pages/Home.vue')
    }
]

const router=createRouter({
    history:createWebHistory()
    ,routes:routerList
})

export default router