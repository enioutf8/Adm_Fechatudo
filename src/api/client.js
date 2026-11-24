import axios from 'axios';

// Cliente único da API: envia o token em TODA chamada e trata sessão expirada (401) em um só lugar.
// Em produção o admin roda no mesmo domínio do site (/corporativo), então a base é a própria origem.
// Em desenvolvimento, o "proxy" do package.json manda /api e /cliente para o servidor local.
export const TOKEN_KEY = 'tokenAdmin';
export const USER_KEY = 'admin';

export const baseURL = process.env.REACT_APP_API_ORIGIN || '';
const client = axios.create({ baseURL });

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

client.interceptors.request.use((cfg) => {
    const token = read(TOKEN_KEY);
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

let onUnauthorized = null;
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

client.interceptors.response.use(
    (r) => r,
    (err) => {
        const url = String(err?.config?.url || '');
        if (err?.response?.status === 401 && !url.includes('company-authenticate')) onUnauthorized?.();
        return Promise.reject(err);
    }
);

// Mensagem amigável de erro da API (os módulos antigos usam campos diferentes)
export const errMsg = (err, fallback = 'Não foi possível concluir. Tente novamente.') => {
    const d = err?.response?.data;
    if (err?.response?.status === 403) return 'Acesso restrito à administração.';
    if (err?.code === 'ERR_NETWORK') return 'Sem conexão com o servidor.';
    const msg = (typeof d === 'string' && d.length < 200 && d) || d?.message || d?.error || d?.err || d?.msg;
    return typeof msg === 'string' && msg ? msg : fallback;
};

// Imagens do site (/uploads/...) vistas a partir do admin
export const assetUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return `${baseURL}${String(path).startsWith('/') ? '' : '/'}${path}`;
};

export const siteUrl = (path = '') => `${process.env.REACT_APP_SITE_URL || 'https://fechatudo.com.br'}${path}`;

export default client;
