import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import {
    BsGrid1X2, BsReceipt, BsPeople, BsBoxSeam, BsTools, BsDiagram3, BsTag, BsList, BsX, BsPersonCircle,
    BsBoxArrowRight, BsImages, BsMenuButtonWide, BsLayoutTextWindow, BsFileText, BsArrowRepeat, BsBell,
    BsBoxArrowUpRight, BsStars, BsHouseDoor, BsBug, BsCartPlus,
} from 'react-icons/bs';
import { useAuth } from './AuthContext';
import api from '../api/admin';
import { siteUrl } from '../api/client';
import logo from '../img/logo.png';

// Menu lateral, agrupado por assunto
const NAV = [
    { section: 'Loja' },
    { to: '/painel', label: 'Painel', icon: BsGrid1X2 },
    { to: '/pedidos', label: 'Pedidos', icon: BsReceipt, badge: (r) => r?.pedidosPendentes },
    { to: '/clientes', label: 'Clientes', icon: BsPeople },
    { to: '/avisos-estoque', label: 'Avisos de estoque', icon: BsBell, badge: (r) => r?.avisosPendentes },
    { section: 'Catálogo' },
    { to: '/produtos', label: 'Produtos', icon: BsBoxSeam },
    { to: '/categorias', label: 'Categorias', icon: BsDiagram3 },
    { to: '/marcas', label: 'Marcas', icon: BsTag },
    { to: '/instalacoes', label: 'Instalações', icon: BsTools },
    { to: '/isales', label: 'iSales - Api', icon: BsArrowRepeat, badge: (r) => r?.semIsales },
    { to: '/reposicao', label: 'Reposição', icon: BsCartPlus },
    { section: 'Site' },
    { to: '/layout/banners', label: 'Banners e logo', icon: BsImages },
    { to: '/layout/menu', label: 'Menu', icon: BsMenuButtonWide },
    { to: '/layout/vitrines', label: 'Vitrines da home', icon: BsHouseDoor },
    { to: '/layout/rodape', label: 'Rodapé', icon: BsLayoutTextWindow },
    { to: '/institucional', label: 'Institucional', icon: BsFileText },
    { to: '/conteudo', label: 'Conteúdo das páginas', icon: BsStars, soon: true },
    { section: 'Sistema' },
    { to: '/log-erros', label: 'Log de erros', icon: BsBug },
];

const Layout = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menu, setMenu] = useState(false);
    const [resumo, setResumo] = useState(null);
    const [busca, setBusca] = useState('');

    // Contadores do menu: agora e a cada 2 min
    const loadResumo = useCallback(() => api.dashboard().then(setResumo).catch(() => { /* 401 já leva ao login */ }), []);
    useEffect(() => {
        if (!token) return undefined;
        loadResumo();
        const t = setInterval(() => { if (!document.hidden) loadResumo(); }, 120000);
        return () => clearInterval(t);
    }, [token, loadResumo]);

    useEffect(() => { setMenu(false); }, [location.pathname]);

    if (!token) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

    const goSearch = (e) => {
        e.preventDefault();
        const t = busca.trim();
        if (!t) return;
        navigate(`/produtos?q=${encodeURIComponent(t)}`);
        setBusca('');
    };

    return (
        <div className={`lay ${menu ? 'lay-menu-open' : ''}`}>
            <aside className='sbar' aria-label="Menu principal">
                <div className='sbar-top'>
                    <img src={logo} alt="Fechatudo" className='sbar-logo' />
                    <button type="button" className='sbar-close' onClick={() => setMenu(false)} aria-label="Fechar menu"><BsX /></button>
                </div>
                <nav>
                    {NAV.filter((n) => !n.soon).map((n) => {
                        if (n.section) return <div key={n.section} className='sbar-sec'>{n.section}</div>;
                        const { to, label, icon: I, badge } = n;
                        const b = badge?.(resumo);
                        return (
                            <NavLink key={to} to={to} className={({ isActive }) => `sbar-link ${isActive ? 'sbar-on' : ''}`}>
                                <I aria-hidden="true" />
                                <span>{label}</span>
                                {b > 0 && <span className='sbar-badge'>{b}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
                <div className='sbar-foot'>
                    <span>{user?.name}</span>
                    <small>{user?.email || 'Administrador'}</small>
                </div>
            </aside>
            <div className='sbar-backdrop' onClick={() => setMenu(false)} aria-hidden="true" />

            <div className='main'>
                <header className='tbar'>
                    <button type="button" className='tbar-menu' onClick={() => setMenu(true)} aria-label="Abrir menu"><BsList /></button>
                    <form className='tbar-search' onSubmit={goSearch} role="search">
                        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto pelo nome ou marca" aria-label="Buscar produto" />
                    </form>
                    <a className='tbar-site' href={siteUrl('/')} target="_blank" rel="noreferrer"><BsBoxArrowUpRight /> Ver site</a>
                    <Dropdown align="end">
                        <Dropdown.Toggle as="button" className='tbar-user' aria-label="Menu do usuário">
                            <BsPersonCircle aria-hidden="true" /><span>{user?.name}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/conta')}><BsPersonCircle /> Minha conta</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => logout()}><BsBoxArrowRight /> Sair</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </header>
                <main className='content'>
                    <Outlet context={{ resumo, reloadResumo: loadResumo }} />
                </main>
            </div>
        </div>
    );
};

export default Layout;
