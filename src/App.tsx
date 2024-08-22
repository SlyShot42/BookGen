
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import BookContentSelector from './pages/Content Selection/ContentSelection'

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookContentSelector />} />
    </Routes>
    
  )
}

export default App
