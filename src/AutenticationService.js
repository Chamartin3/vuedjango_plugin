import axios from 'axios'
import APIService from './APIService'

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
    let msg = {status:error.response.status, message: "error" }
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
