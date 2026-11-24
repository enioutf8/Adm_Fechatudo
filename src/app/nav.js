import React, { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

// Nome de cada menu (para o "Voltar para …")
const MENUS = [
    ['/painel', 'Painel'], ['/pedidos', 'Pedidos'], ['/clientes', 'Clientes'], ['/produtos', 'Produtos'],
    ['/instalacoes', 'Instalações'], ['/categorias', 'Categorias'], ['/marcas', 'Marcas'], ['/layout', 'Aparência do site'],
    ['/institucional', 'Institucional'], ['/isales', 'iSales - Api'], ['/avisos-estoque', 'Avisos de estoque'], ['/conta', 'Minha conta'],
];
export const menuLabel = (pathname) => (MENUS.find(([p]) => pathname.startsWith(p)) || [null, 'a tela anterior'])[1];

/**
 * Navegação que lembra a origem: go('/produtos/33') leva ao produto e guarda de onde veio
 * (tela + filtros da URL). Na tela de destino, <BackLink /> mostra "Voltar para iSales".
 */
export const useGo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    return useCallback((to) => navigate(to, {
        state: { from: { path: location.pathname + location.search, label: menuLabel(location.pathname) } },
    }), [navigate, location.pathname, location.search]);
};

/**
 * "Voltar": se a tela foi aberta a partir de outro menu, volta exatamente para lá (com os filtros);
 * senão usa o destino padrão (fallbackTo).
 */
export const BackLink = ({ fallbackTo, fallbackLabel }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from;
    if (from) {
        const voltar = () => {
            if (window.history.state?.idx > 0) navigate(-1);
            else navigate(from.path);
        };
        return <button type="button" className='back' onClick={voltar}><BsArrowLeft /> Voltar para {from.label}</button>;
    }
    if (!fallbackTo) return null;
    return <Link to={fallbackTo} className='back'><BsArrowLeft /> {fallbackLabel}</Link>;
};
