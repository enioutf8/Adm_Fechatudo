import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/admin';
import { setOnUnauthorized, TOKEN_KEY, USER_KEY } from '../api/client';

// Sessão do administrador (login da empresa em /api/company-authenticate)
const AuthContext = createContext(null);

const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch { return null; } };
const store = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sem storage */ } };

// Token expirado? (lê o "exp" do JWT sem validar a assinatura — quem valida é a API)
const expired = (token) => {
    try {
        const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return p?.exp ? p.exp * 1000 < Date.now() : false;
    } catch { return true; }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem(TOKEN_KEY);
        return t && !expired(t) ? t : null;
    });
    const [user, setUser] = useState(() => readJSON(USER_KEY));
    const [sessionMsg, setSessionMsg] = useState('');

    const logout = useCallback((msg = '') => {
        store(TOKEN_KEY, null); store(USER_KEY, null);
        setToken(null); setUser(null);
        setSessionMsg(msg);
    }, []);

    useEffect(() => {
        setOnUnauthorized(() => logout('Sua sessão expirou. Entre novamente.'));
        return () => setOnUnauthorized(null);
    }, [logout]);

    const login = useCallback(async (email, password) => {
        const r = await api.login(email, password);
        if (!r?.token) throw new Error(r?.message || 'Login inválido');
        const c = r.company || {};
        const u = { id: c.id_company, name: c.trade_name || c.corporateName || 'Administrador', email: c.email };
        store(TOKEN_KEY, r.token);
        store(USER_KEY, JSON.stringify(u));
        setToken(r.token); setUser(u); setSessionMsg('');
        return u;
    }, []);

    const value = useMemo(() => ({ token, user, login, logout, sessionMsg }), [token, user, login, logout, sessionMsg]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
