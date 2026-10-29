import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home/HomePage'
import { ArenaSelectPage } from './pages/ArenaSelect/ArenaSelectPage'
import { LevelMapPage } from './pages/LevelMap/LevelMapPage'
import { LevelPlayPage } from './pages/LevelPlay/LevelPlayPage'
import { DsaListPage } from './pages/DsaList/DsaListPage'
import { DsaSolvePage } from './pages/DsaSolve/DsaSolvePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/system-design" element={<ArenaSelectPage />} />
      <Route path="/system-design/social-media" element={<LevelMapPage />} />
      <Route
        path="/system-design/social-media/:levelId"
        element={<LevelPlayPage />}
      />
      <Route path="/dsa" element={<DsaListPage />} />
      <Route path="/dsa/:questionId" element={<DsaSolvePage />} />
    </Routes>
  )
}
