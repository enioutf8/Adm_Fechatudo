import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { ToastProvider } from './components/Toasts';
import Layout from './app/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Clients from './pages/Clients';
import StockAlerts from './pages/StockAlerts';
import Products from './pages/Products';
import ProductEdit from './pages/product/ProductEdit';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Installations from './pages/Installations';
import Isales from './pages/Isales';
import Banners from './pages/layout/Banners';
import Menu from './pages/layout/Menu';
import Showcases from './pages/layout/Showcases';
import Footer from './pages/layout/Footer';
import Institutional from './pages/Institutional';
import Account from './pages/Account';

// Rotas do admin (publicado em /corporativo). Tudo dentro de <Layout> exige login.
function App() {
  return (
    <BrowserRouter basename="/corporativo">
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/painel" replace />} />
            <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
            <Route element={<Layout />}>
              <Route path="/painel" element={<Dashboard />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/pedidos/:id" element={<OrderDetail />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/avisos-estoque" element={<StockAlerts />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produtos/:id" element={<ProductEdit />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/marcas" element={<Brands />} />
              <Route path="/instalacoes" element={<Installations />} />
              <Route path="/isales" element={<Isales />} />
              <Route path="/layout/banners" element={<Banners />} />
              <Route path="/layout/menu" element={<Menu />} />
              <Route path="/layout/vitrines" element={<Showcases />} />
              <Route path="/layout/rodape" element={<Footer />} />
              <Route path="/institucional" element={<Institutional />} />
              <Route path="/conta" element={<Account />} />
            </Route>
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
