import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TrainingStylePage from './pages/TrainingStyle'
import StrengthPage from './pages/StrengthPage'
import HypertrophyPage from './pages/HypertrophyPage'
import ColorDesignPage from './pages/ColorDesignPage'

function Main(){
    return(
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<LandingPage />} />
                <Route exact path="/TrainingStylePage" element={<TrainingStylePage />} />
                <Route exact path="/StrengthPage" element={<StrengthPage />} />
                <Route exact path="/HypertrophyPage" element={<HypertrophyPage />} />
                <Route exact path="ColorDesign" element={<ColorDesignPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default Main
