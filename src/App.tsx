
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import Book from './pages/book/Book'

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<Book />} />
    </Routes>
    
  )
}

export default App
