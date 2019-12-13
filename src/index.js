import Vue from 'vue'
import Auth from './AutenticationService'
import APIModel from './APIService'

// Recieves a info object DJANGO_CONTEXT
Vue.prototype.$django = {...DJANGO_CONTEXT}
// {
  // 'user'
  // 'csrf_token':
  // api_route
  // navigation_paths
  // 'autentication': {
    // auth_path
    // on_login
    // on_logout
  // }
  // '_actions': actions
// }





function generateAPIModels() {
  let mappedActions=DJANGO_CONTEXT._actions
  let token=DJANGO_CONTEXT.csrf_token
  let api=DJANGO_CONTEXT.api_route
  let apiModels={}
  Object.entries(mappedActions).forEach(([key,value])=>{
    apiModels[key]= new APIModel(value, api, key, token)
  })
  Vue.prototype.$django.models= apiModels
}


function getAutentication() {
  let AUTH = new Auth(DJANGO_CONTEXT.autentication.auth_path, DJANGO_CONTEXT.autentication.auth_path, DJANGO_CONTEXT.autentication.on_logout)
  Vue.prototype.$django.auth= AUTH
}

getAutentication()
generateAPIModels()
window.django=Vue.prototype.$django

