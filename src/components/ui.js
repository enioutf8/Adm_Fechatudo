import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsChevronLeft, BsChevronRight, BsCloudArrowUp, BsInbox, BsSearch, BsXCircleFill } from 'react-icons/bs';
import { STATUS_LABEL } from '../utils/status';
import { money } from '../utils/formats';

// Componentes pequenos e reutilizáveis do ADM

export const StatusBadge = ({ status, children }) => (
    <span className={`sb sb-${status}`}>{children || STATUS_LABEL[status] || status}</span>
);

export const PageHeader = ({ title, subtitle, children }) => (
    <header className='ph'>
        <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
        {children && <div className='ph-actions'>{children}</div>}
    </header>
);

export const KpiCard = ({ label, value, hint, tone, onClick, icon }) => {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag type={onClick ? 'button' : undefined} className={`kpi ${tone ? `kpi-${tone}` : ''} ${onClick ? 'kpi-click' : ''}`} onClick={onClick}>
            <span className='kpi-label'>{icon}{label}</span>
            <strong className='kpi-value'>{value}</strong>
            {hint && <small className='kpi-hint'>{hint}</small>}
        </Tag>
    );
};

export const EmptyState = ({ title = 'Nada por aqui', text, children }) => (
    <div className='empty'>
        <BsInbox aria-hidden="true" />
        <strong>{title}</strong>
        {text && <p>{text}</p>}
        {children}
    </div>
);

export const ErrorState = ({ text, onRetry }) => (
    <div className='empty empty-error'>
        <strong>Não foi possível carregar</strong>
        <p>{text}</p>
        {onRetry && <button type="button" className='btn-ghost' onClick={onRetry}>Tentar novamente</button>}
    </div>
);

export const SkeletonRows = ({ rows = 6, cols = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className='sk-row'>
                {Array.from({ length: cols }).map((__, j) => <td key={j}><span className='sk' /></td>)}
            </tr>
        ))}
    </>
);

export const Skeleton = ({ h = 16, w = '100%' }) => <span className='sk' style={{ height: h, width: w }} />;

// Números exibidos: primeira, última e as vizinhas da atual; "…" nos saltos. Ex.: 1 … 4 5 6 … 20
const pageList = (page, pages) => {
    const set = new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages));
    if (page <= 3) [2, 3, 4].forEach(n => n <= pages && set.add(n));
    if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach(n => n >= 1 && set.add(n));
    const nums = [...set].sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => {
        const salto = i > 0 ? n - nums[i - 1] : 1;
        if (salto === 2) out.push(n - 1);          // falta só uma página: mostra o número em vez de "…"
        else if (salto > 2) out.push(`gap${n}`);
        out.push(n);
    });
    return out;
};

// Paginação única do ADM: ‹ Anterior  1 … 4 [5] 6 … 20  Próxima ›   (página atual em destaque)
export const Pagination = ({ page, pages, onChange, total, label = 'registros' }) => {
    const info = total != null ? `${total} ${label}` : '';
    if (!pages || pages <= 1) return info ? <div className='pg'><span className='pg-info'>{info}</span></div> : null;
    const ir = (n) => {
        if (n < 1 || n > pages || n === page) return;
        onChange(n);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // nova página começa do topo da lista
    };
    return (
        <nav className='pg' aria-label="Paginação">
            <div className='pg-nav'>
                <button type="button" className='pg-step' disabled={page <= 1} onClick={() => ir(page - 1)}>
                    <BsChevronLeft aria-hidden="true" /> Anterior
                </button>
                <div className='pg-nums'>
                    {pageList(page, pages).map(n => (typeof n === 'string'
                        ? <span key={n} className='pg-gap' aria-hidden="true">…</span>
                        : (
                            <button key={n} type="button" className={`pg-num ${n === page ? 'pg-num-on' : ''}`}
                                aria-current={n === page ? 'page' : undefined} aria-label={`Página ${n}`} onClick={() => ir(n)}>
                                {n}
                            </button>
                        )))}
                </div>
                <button type="button" className='pg-step' disabled={page >= pages} onClick={() => ir(page + 1)}>
                    Próxima <BsChevronRight aria-hidden="true" />
                </button>
            </div>
            <span className='pg-info'>{info ? `${info} · ` : ''}página {page} de {pages}</span>
        </nav>
    );
};

// Campo de busca com espera (debounce) de 350 ms
export const SearchInput = ({ value, onChange, placeholder = 'Buscar', autoFocus }) => {
    const [text, setText] = useState(value || '');
    const first = useRef(true);
    useEffect(() => { setText(value || ''); }, [value]);
    useEffect(() => {
        if (first.current) { first.current = false; return undefined; }
        const t = setTimeout(() => { if (text !== value) onChange(text); }, 350);
        return () => clearTimeout(t);
    }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <label className='si'>
            <BsSearch aria-hidden="true" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus} />
            {text && <button type="button" onClick={() => { setText(''); onChange(''); }} aria-label="Limpar busca"><BsXCircleFill /></button>}
        </label>
    );
};

// Confirmação com o efeito da ação descrito ("o cliente será notificado")
export const ConfirmDialog = ({ show, title, children, confirmLabel = 'Confirmar', tone = 'primary', busy, onConfirm, onCancel, disabled }) => (
    <Modal show={show} onHide={busy ? undefined : onCancel} centered>
        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{title}</Modal.Title></Modal.Header>
        <Modal.Body className='md-body'>{children}</Modal.Body>
        <Modal.Footer>
            <button type="button" className='btn-ghost' onClick={onCancel} disabled={busy}>Voltar</button>
            <button type="button" className={`btn-${tone}`} onClick={onConfirm} disabled={busy || disabled}>{busy ? 'Aguarde…' : confirmLabel}</button>
        </Modal.Footer>
    </Modal>
);

// Área de arrastar e soltar arquivo (NF)
export const FileDrop = ({ onFile, accept = '.xml,.pdf', busy, text = 'Arraste a NF (XML ou PDF) ou clique para escolher' }) => {
    const [over, setOver] = useState(false);
    const input = useRef(null);
    const pick = (f) => { if (f) onFile(f); if (input.current) input.current.value = ''; };
    return (
        <div
            className={`fd ${over ? 'fd-over' : ''} ${busy ? 'fd-busy' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
            onClick={() => !busy && input.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        >
            <BsCloudArrowUp aria-hidden="true" />
            <span>{busy ? 'Enviando…' : text}</span>
            <input ref={input} type="file" accept={accept} hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
    );
};

// Abas com contador
export const Tabs = ({ items, value, onChange }) => (
    <div className='tabs' role="tablist">
        {items.map(t => (
            <button key={t.key} type="button" role="tab" aria-selected={value === t.key}
                className={`tab ${value === t.key ? 'tab-on' : ''}`} onClick={() => onChange(t.key)}>
                {t.label}
                {t.count != null && <span className='tab-count'>{t.count}</span>}
            </button>
        ))}
    </div>
);

/**
 * Barras verticais de uma série (ex.: vendas por dia). Uma só cor, barras finas com topo arredondado
 * (4px), 2px de espaço entre barras, eixo discreto e tooltip ao passar o mouse/teclado.
 */
export const BarChart = ({ data, valueKey = 'valor', labelKey = 'dia', format = money, formatLabel = (l) => l, height = 180, title }) => {
    const [hover, setHover] = useState(null);
    const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
    const n = data.length || 1;
    const W = 100 / n; // largura de cada coluna (%)
    return (
        <figure className='bc' aria-label={title}>
            <div className='bc-plot' style={{ height }} onMouseLeave={() => setHover(null)}>
                <div className='bc-grid' aria-hidden="true"><span /><span /><span /></div>
                {data.map((d, i) => {
                    const v = Number(d[valueKey]) || 0;
                    const h = Math.max((v / max) * 100, v > 0 ? 1.5 : 0);
                    return (
                        <button key={i} type="button" className={`bc-col ${hover === i ? 'bc-on' : ''}`} style={{ left: `${i * W}%`, width: `${W}%` }}
                            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                            aria-label={`${formatLabel(d[labelKey])}: ${format(v)}`}>
                            <span className='bc-bar' style={{ height: `${h}%` }} />
                        </button>
                    );
                })}
                {hover != null && data[hover] && (
                    <div className='bc-tip' style={{ left: `${Math.min(Math.max((hover + 0.5) * W, 12), 88)}%` }}>
                        <span>{formatLabel(data[hover][labelKey])}</span>
                        <strong>{format(Number(data[hover][valueKey]) || 0)}</strong>
                        {data[hover].qtd != null && <small>{data[hover].qtd} pedido(s)</small>}
                    </div>
                )}
            </div>
            <div className='bc-axis' aria-hidden="true">
                <span>{formatLabel(data[0]?.[labelKey])}</span>
                <span>{formatLabel(data[data.length - 1]?.[labelKey])}</span>
            </div>
        </figure>
    );
};
