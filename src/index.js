import Vue from 'vue'
import APIModel from './APIService'

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

async function getModels() {
  // Gert all the root api views (only work with viewsets)
  let base_urls=[]
  let root_routes=DJANGO_CONTEXT.model_routes
  for (var i = 0; i < root_routes.length; i++) {
    let url=DJANGO_CONTEXT.api_route+'/'+root_routes[i]
    let serv=new Base(url)
    base_urls.push(serv.list())
  }
  let services = await Promise.all(base_urls)
  let all_serv={}

  for (var i = 0; i < services.length; i++) {
    if(typeof(services[i])==='object'){
      all_serv={...all_serv,...services[i]}
    }
  }

  let models={}
  Object.entries(all_serv).forEach(([key,value])=>{
    models[key]= new Base(value, key, true)
  })
  Vue.prototype.$django.MVSmodels=models
}

window.django=Vue.prototype.$django
