import Vue from 'vue'
import Auth from './AutenticationService'
import APIModel from './APIService'

// Recieves a info object
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
Vue.prototype.$django = {...DJANGO_CONTEXT}

function asembleURL(pieces, params=[]) {
  if (pieces.length===1) return pieces[0]
  let url =''
  let paramIndex = 0
  for (var i = 0; i < pieces.length; i++) {
    // is a piece of url
    if (i===0 || i%2===0) {
      url=url+pieces[i]
    }else{
      // is a variable
      url=url+params[paramIndex]
      paramIndex++
    }
  }
  return url
}

function processParams(params) {
  let param_names=[]
  for (var i = 0; i < params.length; i++) {
    param_names.push(params[i].name)
  }
  return param_names
}


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

