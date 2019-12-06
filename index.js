import { Service } from './src'


function genServices(list) {
  let serv_list = []
  for (let i = 0; i < list.length; i++) {
    serv_list.push(Service(list[i].link, list[i].name ))
  }
  return serv_list
}

export default genServices

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