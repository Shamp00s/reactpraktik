import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Explore from './pages/Explore.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';
import Cart from './pages/Cart.jsx';
import './App.css';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Catalog />} />
        <Route path="/items/:id" element={<ProductDetails />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Защищенные маршруты */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}