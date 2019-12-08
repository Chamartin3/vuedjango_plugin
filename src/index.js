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

// function generateAPIActions(actionlist) {
  // let actions={}
  // let asembleURL=asembleURL
  // for (var i = 0; i < actionlist.length; i++) {
  //   let param_names=processParams(actionlist[i].fullpath.params)
  //   let type = actionlist[i].type
  //   let service = new Base(actionlist[i].basepath)
  //   actions[actionlist[i].name]

      // return actionlist[1].type
    // actions[actionlist[i].name]=new Function([...param_names],
    //   'let pieces = actionlist[i].fullpath.pieces; asembleURL(pieces); return arguments'
    // )
    //   // return actionlist[1].type


  // return actions

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

// async function getModels() {
//   // Gert all the root api views (only work with viewsets)
//   let base_urls=[]
//   let root_routes=DJANGO_CONTEXT.model_routes
//   for (var i = 0; i < root_routes.length; i++) {
//     let url=DJANGO_CONTEXT.api_route+'/'+root_routes[i]
//     let serv=new Base(url)
//     base_urls.push(serv.list())
//   }
//   let services = await Promise.all(base_urls)
//   let all_serv={}
//
//   for (var i = 0; i < services.length; i++) {
//     if(typeof(services[i])==='object'){
//       all_serv={...all_serv,...services[i]}
//     }
//   }
//
//   let models={}
//   Object.entries(all_serv).forEach(([key,value])=>{
//     models[key]= new Base(value, key, true)
//   })
//   Vue.prototype.$django.MVSmodels=models
// }

// getModels()
getAutentication()
generateAPIModels()
window.django=Vue.prototype.$django

