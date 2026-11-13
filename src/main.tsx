import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { initServiceWorker } from './sw'

createRoot(document.getElementById('root')!).render(<App />)

initServiceWorker()
