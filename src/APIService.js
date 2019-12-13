mport axios from 'axios'

const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https://' : 'http://'

const BASE_URL = PROTOCOL + window.location.host

function checkSlashes (url) {
  let finalSlash = url.substr(-1)
  if (finalSlash != '/') {
    url = url + '/'
  }

  // remove the double final slash
  let finalChars = url.substr(-2)
  if (finalChars.substr(1, 1) === finalChars.substr(0, 1)) {
    url = url.substr(0, url.length - 1)
  }

  return url
}

class EndPoint {
  constructor (basepath, action) {
    this.method = action.type
    this.is_unique = action.unique
    this.defaultMode = process.env.NODE_ENV === 'production' ? 'silent' : 'console'
    let service = axios.create({
      headers: { csrf: 'token'
      }
    })
    service.defaults.xsrfCookieName = 'csrftoken'
    service.defaults.xsrfHeaderName = 'X-CSRFToken'
    this.service = service
    this.basepath = basepath
    this.processURL(action.route)
    switch (this.method) {
      case 'GET':
        if (action.route.params.length > 0) this.genericName = 'detail'
        else this.genericName = 'list'
        // this.name=this.genericName
        break
      case 'POST':
        this.genericName = 'create'
        // this.name=this.genericName
        break
      case 'PATCH':
        this.genericName = 'partial_update'
        // this.name=this.genericName

        break
      case 'PUT':
        this.genericName = 'update'
        // this.name=this.genericName
        break
      case 'DELETE':
        this.genericName = 'destroy'
        // this.name=this.genericName
        break
      default:
        this.genericName = action.name
    }
    this.name = action.name
    this.pieces = action.route.pieces
  }

  processURL (route) {
    let pieces = route.pieces
    this.url = this.basepath + pieces[0]

    // Adds de final slash if needed

    this.url = checkSlashes(this.url)

    this.detail = false
    this.wrapper = (payload = null, extraParams=null) => this.request(this.url, null, payload, extraParams)
    if (pieces.length >= 2) {
      this.detail = true
      this.wrapper = (id, payload = null, extraParams=null) => this.request(this.url, id, payload, extraParams)
    }
    if (pieces.length >= 3) this.name = pieces[2]
  }

  manageResponse (response, mode = 'console', callback = null) {
    switch (mode) {
      case 'error':
        return Promise.reject(response)
      case 'silent':
        return response.data
      case 'console':
        console.log(response.status)
        return response.data
      case 'loud':
        alert(response.status)
        return response.data
      case 'custom':
        if (!callback) {
          return alert('Callback Missing')
        } else {
          return callback(response)
        }
    }
  }

  addParams(url,params){

    let paramsStr=''
    let count=0
    Object.entries(params).forEach(([key, value]) => {
      let separator = count === 0 ? '?':'&'
      if (typeof value=='object') {
        value=JSON.stringify(value)
      }
      paramsStr = paramsStr + `${separator}${key}=${value}`
      count++
    });
    return url + paramsStr
  }

  request (path, id = null, payload = null, extraparams=null) {
    let fileDownload=false
    let url = path
    if (this.detail) url = url + id
    if (this.name && this.pieces.length >= 3) url = url + this.pieces[2]


    url = checkSlashes(url)
    if (extraparams && extraparams.onlyUrl) {
      if (this.method==='GET' && payload) return this.addParams(url,payload)
      return url
    }

    if (extraparams) {
      url = this.addParams(url,extraparams)
    }
    switch (this.method) {
      case 'GET':
        if (payload) {
          return this.service.get(url, { params: payload })
            .then(
              response => this.manageResponse(response, this.defaultMode),
              error => this.manageResponse(error, 'error')
            )
        } else {
          return this.service.get(url)
            .then(
              response => this.manageResponse(response, this.defaultMode),
              error => this.manageResponse(error, 'error')
            )
        }
      case 'POST':
        return this.service.post(url, payload)
          .then(
            response => this.manageResponse(response, this.defaultMode),
            error => this.manageResponse(error, 'error')
          )
      case 'PATCH':
        return this.service.patch(url, payload)
          .then(
            response => this.manageResponse(response, this.defaultMode),
            error => this.manageResponse(error, 'error')
          )
      case 'PUT':
        return this.service.put(url, payload)
          .then(
            response => this.manageResponse(response, this.defaultMode),
            error => this.manageResponse(error, 'error')
          )
      case 'DELETE':
        return this.service.delete(url)
          .then(
            response => this.manageResponse(response, this.defaultMode),
            error => this.manageResponse(error, 'error')
          )
    }
  }
}

class APIModel {
  constructor (model_map, api_route, name = null, csrf = null) {
    this.name = name === null ? '' : name
    this.base_url = BASE_URL + '/' + api_route
    let actions = {}
    console.log(this.base_url)
    for (var i = 0; i < model_map.length; i++) {
      let endpoint = new EndPoint(this.base_url, model_map[i])
      let viewsetnames = ['detail', 'list', 'delete', 'patch', 'put', 'post']

      let name = endpoint.name
      if (!endpoint.is_unique) name = endpoint.method.toLowerCase() + '_' + endpoint.name
      if (viewsetnames.includes(endpoint.name)) name = endpoint.genericName
      if (actions.hasOwnProperty(name)) {
        let n = 1
        while (actions.hasOwnProperty(name)) {
          name = endpoint.genericName + n
          n++
        }
      }
      actions[name] = endpoint.wrapper
      this[name] = endpoint.wrapper
    }
  }
}

export default APIModel