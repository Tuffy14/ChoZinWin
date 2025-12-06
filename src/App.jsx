import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Adventure from './pages/Adventure'
import Puzzle from './pages/Puzzle'
import Celebration from './pages/Celebration'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/celebration" element={<Celebration />} />
      </Routes>
    </Router>
  )
}

export default App

