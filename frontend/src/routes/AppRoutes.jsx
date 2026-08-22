
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import UserRegister from '../pages/UserRegister'
import UserLogin from '../pages/UserLogin'
import FoodPartnerLogin from '../pages/FoodPartnerLogin'
import FoodPartnerRegister from '../pages/FoodPartnerRegister'
import Home from '../pages/general/Home'
import ProfilePage from '../pages/general/ProfilePage'
import FoodPartnerProfile from '../pages/FoodPartner/FoodPartnerProfile'
import FoodPartnerStore from '../pages/FoodPartner/FoodPartnerStore'
import CreatedFood from '../pages/FoodPartner/CreatedFood'

const AppRoutes = () => {
  return (
    <Router>
        <Routes>
            <Route path='/user/register' element={<UserRegister /> } />
            <Route path='/user/login' element={<UserLogin /> } />
            <Route path='/food-partner/register' element={<FoodPartnerRegister/> } />
            <Route path='/food-partner/login' element={<FoodPartnerLogin/> } />
            <Route path='/' element={<Home/>} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/food-partner/home' element={<FoodPartnerProfile />} />
            <Route path='/food-partner/:partnerId' element={<FoodPartnerStore />} />
            <Route path='/food-partner/create-food' element={<CreatedFood />} />
            <Route path='/create-food' element={<CreatedFood />} />
            <Route path='/creare-food' element={<CreatedFood />} />
        </Routes>
    </Router>
  )
}

export default AppRoutes