import './index.scss'
import tabUI from '../../js/tab'
console.log('121')
tabUI.init()
tabUI.tab($('.tab-wrap2'), {
  autoPlay: 2000,
  animate: true
})
