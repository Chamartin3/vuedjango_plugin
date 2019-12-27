import Auth from './Autentication'
import APIModel from './APIModel'

function generateAPIModels(sourceMap) {
  let mappedActions = sourceMap._actions
  let token = sourceMap.csrf_token
  let api = sourceMap.api_route
  let apiModels = {}
  Object.entries(mappedActions).forEach(([key,value])=>{
    apiModels[key]= new APIModel(value, api, key, token)
  })
  return apiModels
}

function getAutentication(sourceMap) {
  let AUTH = new Auth(
    sourceMap.autentication.auth_path, 
    sourceMap.autentication.auth_path, 
    sourceMap.autentication.on_logout)
  return AUTH
}

class Django {
  constructor (sourceMap) {
    this.user = sourceMap.user
    this.navigation_paths = sourceMap.navigation_paths
    this.token = sourceMap.token
    this.getAutentication = getAutentication(sourceMap)
    this.models = generateAPIModels(sourceMap)
  }
}

export default Django