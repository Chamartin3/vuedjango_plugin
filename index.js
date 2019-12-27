import Vue from 'vue'
import Django from './src'

Vue.prototype.$django = Django(DJANGO_CONTEXT)