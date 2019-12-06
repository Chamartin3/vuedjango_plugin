import axios from 'axios'

const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https://' : 'http://'

const BASE_URL = PROTOCOL + window.location.host

class Service {
  constructor (path, name = null) {
    let service = axios.create({
      headers: { csrf: 'token'

      }
    })
    service.defaults.xsrfCookieName = 'csrftoken'
    service.defaults.xsrfHeaderName = 'X-CSRFToken'

    service.interceptors.response.use(this.handleSuccess, this.handleError)
    this.service = service
    this.jsonpath = BASE_URL + path
    this.name = name === null ? '' : name
    this.defaultMode = process.env.NODE_ENV === 'production' ? 'silent' : 'console'
  }

  handleSuccess (response) {
    return response
  }

  handleError (error) {
    let msg
    switch (error.response.status) {
      case 400:
        msg = { type: 401, message: 'Error en formulario', error: error }
        break
      case 401:
        msg = { type: 401, message: 'sin autorización', error: error }
        break
      case 403:
        msg = { type: 403, message: 'Prohibido', error: error }
        break
      case 405:
        msg = { type: 405, message: 'Metodo no permitido', error: error }
        break
      case 404:
        msg = { type: 404, message: 'Metodo no permitido', error: error }
        break
      case 500:
        msg = { type: 500, message: 'Error en servidor', error: error }
        break
      case 501:
        msg = { type: 501, message: 'Not Implemented', error: error }
        break
      case 508:
        msg = { type: 508, message: 'Bucle infinito detectado', error: error }
        break
      default:
        msg = { type: 0, message: 'Error no identificado', error: error }
        break
    }
    msg.data = error.response.data
    return Promise.reject(msg)
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

  list_url () {
    return this.jsonpath
  }
  // Llamar un listado o un registro
  list (mode = 'console', callback = null, filters=null) {
    if (filters) {
    return this.service.get(this.jsonpath,{
      params:filters
    }).then(
      response => this.manageResponse(response),
      error => this.manageResponse(error)
    )
  }

    return this.service.get(this.jsonpath).then(
      response => this.manageResponse(response),
      error => this.manageResponse(error)
    )
  }

  // Enviar un nuevo registro
  create (payload, mode = 'console', callback = null) {
    return this.service.request({
      method: 'POST',
      url: this.jsonpath,
      responseType: 'json',
      data: payload
    }).then(
      response => this.manageResponse(response, mode, callback),
      error => this.manageResponse(error, 'error')
    )
  }

  update (id, payload, mode = 'console', callback = null) {
    return this.service.patch(`${this.jsonpath}${id}/`, payload)
      .then(
        response => this.manageResponse(response, mode, callback),
        error => {
          console.log(error)
          this.manageResponse(error, 'error')
        }

      )
  }

  partial_update (id, payload, mode = 'console', callback = null) {
    return this.service.patch(`${this.jsonpath}${id}/`, payload)
      .then(
        response => this.manageResponse(response, mode, callback),
        error => this.manageResponse(error, 'error')
      )
  }

  destroy (id, mode = 'console', callback = null) {
    return this.service.delete(`${this.jsonpath}${id}/`)
      .then(
        response => this.manageResponse(response, mode, callback),
        error => this.manageResponse(error, 'error')
      )
  }

  retrieve (id, mode = 'console', callback = null) {
    return this.service.get(`${this.jsonpath}${id}/`)
      .then(
        response => this.manageResponse(response, mode, callback),
        error =>  this.manageResponse(error, 'error')
      )
  }

  custom(name,  method='get' , detail=false, id=null, payload=null,  mode='console', callback = null){
    
    let url = detail ? `${this.jsonpath}${id}/${name}/` : `${this.jsonpath}${name}/`

    if (method==='get') {
      for (let key in payload){
        url=url+`${payload[key]}/`
      }
      return this.service.get(url)
        .then(
          response => this.manageResponse(response, mode, callback),
          error =>  this.manageResponse(error, 'error')
        )
      }else if (method==='patch') {
        return this.service.patch(url, payload)
          .then(
            response => this.manageResponse(response, mode, callback),
            error =>  this.manageResponse(error, 'error')
          )

      }else if (method==='post') {
        return this.service.request({
          method: 'POST',
          url: url,
          responseType: 'json',
          data: payload
        }).then(
          response => this.manageResponse(response, mode, callback),
          error => this.manageResponse(error, 'error')
        )
      }
      return undefined

  }
}


export default Service
