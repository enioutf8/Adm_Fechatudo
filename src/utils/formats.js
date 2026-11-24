// Formatos usados em todo o admin (moeda, datas, telefone)
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const money = (v) => brl.format(Number(v) || 0);
export const num = (v) => (Number(v) || 0).toLocaleString('pt-BR');

export const toNumber = (v) => {
    if (typeof v === 'number') return v;
    const s = String(v ?? '').trim();
    if (!s) return 0;
    return parseFloat(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s) || 0;
};

export const phone = (v) => {
    const d = String(v || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return v || '';
};

// Link do WhatsApp com DDI do Brasil
export const whatsappLink = (v, text = '') => {
    const d = String(v || '').replace(/\D/g, '');
    if (!d) return '';
    const full = d.startsWith('55') && d.length >= 12 ? d : `55${d}`;
    return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

const toDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null);
export const dateBR = (v) => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleDateString('pt-BR') : ''; };
export const dateTimeBR = (v) => {
    const d = toDate(v);
    return d && !isNaN(d) ? `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '';
};

export const timeAgo = (v) => {
    const d = toDate(v);
    if (!d || isNaN(d)) return '';
    const s = Math.max((Date.now() - d.getTime()) / 1000, 0);
    if (s < 60) return 'agora';
    if (s < 3600) return `há ${Math.floor(s / 60)} min`;
    if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
    const dias = Math.floor(s / 86400);
    return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
};

// Texto sem acento e minúsculo (para buscas locais)
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const productUrl = (p) =>
    `/produto/${p?.id_sub_category || p?.sub_category?.id_sub_category || 0}/${String(p?.Product_Slug || '').toLowerCase()}-${p?.Product_ID}`;
