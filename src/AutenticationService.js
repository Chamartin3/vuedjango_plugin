import axios from 'axios'

// const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
//
// const BASE_URL = PROTOCOL + window.location.host

// const csrftoken = DJANGO_CONTEXT.csrf_token;

class AuthService {
  constructor (token, loginpath, logoutpath='') {
    let service = axios.create({
      headers: {
        csrf: token
      }
    })
    service.defaults.xsrfCookieName = 'csrftoken'
    service.defaults.xsrfHeaderName = 'X-CSRFToken'

    service.interceptors.response.use(this.handleSuccess, this.handleError)
    this.service = service
    this.loginpath = loginpath
    this.logoutpath = logoutpath
    this.token = token
  }

  handleSuccess (response) {
    return response.data
  }

  handleError (error) {
    let msg
    switch (error.response.status) {
      case 400:
        msg = { type: 401, message: 'Error in form', error: error }
        break
      case 401:
        msg = { type: 401, message: 'Unautorized action', error: error }
        break
      case 403:
        msg = { type: 403, message: 'Prohibido', error: error }
        break
      case 405:
        msg = { type: 405, message: 'Method not allowed', error: error }
        break
      case 404:
        msg = { type: 404, message: 'Not Found', error: error }
        break
      case 500:
        msg = { type: 500, message: 'Error in server', error: error }
        break
      case 501:
        msg = { type: 501, message: 'Not Implemented', error: error }
        break
      default:
        msg = { type: 0, message: 'Unidentified Error', error: error }
        break
    }
    msg.data = error.response.data
    return Promise.reject(msg)
  }

  manageResponse (response, mode = 'console', callback = null) {
    switch (mode) {
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
  logout () {
    return axios.get(this.loginpath).then(done=>{
          let host = window.location.protocol + '//' + window.location.host
          window.location = host + this.logoutpath
          return done
        }, fail=>{console.error(fail);return fail})
  }
  // Llamar un listado o un registro
  login(data, destination=null){

    let config = {
      headers: {
        "X-CSRFToken": this.token,
        csrf: this.token
      }
    }
    var qs = require('qs');
    return this.service.post(this.loginpath,  qs.stringify(data), config).then(
        done=>{
          var mensaje = done.message
          if (mensaje=="Exito") {
            // let host = window.location.protocol+"//"+window.location.host
            if (destination) {
              // console.log("going to"+host+INSIDE_URL)
              // window.location = BASE_URL+INSIDE_URL
            }
            return  {type:"success", msj:"Ingresando", done:done}
          }else{
            return  {type:"error", msj:mensaje, done:done}
          }
        },
        fail=>{
          console.log(fail)
          var mensaje=fail.data.message? fail.data.message: 'Fallo'
          console.log(mensaje)
          return  {type:"error", msj:mensaje}

        })
    }

}

export default AuthService
