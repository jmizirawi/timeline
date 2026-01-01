import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as LucideIcons from 'lucide-vue-next'
import './styles/main.scss'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

// Globally register all Lucide icons for easy usage
for (const [key, component] of Object.entries(LucideIcons)) {
    app.component(key, component as any)
}

app.use(pinia)
app.mount('#app')
