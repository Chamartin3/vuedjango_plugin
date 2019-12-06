import { Service } from './src'


const function genServices(list) {
  let serv_list = []
  for (let i = 0; i < list.length; i++) {
    serv_list.push(Service(list[i].link, list[i].name ))
  }
  return serv_list
}

