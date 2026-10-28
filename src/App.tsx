import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home/HomePage'
import { MapSelectPlaceholderPage } from './pages/MapSelectPlaceholder/MapSelectPlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/system-design" element={<MapSelectPlaceholderPage />} />
    </Routes>
  )
}
