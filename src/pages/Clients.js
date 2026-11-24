import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsWhatsapp } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, Pagination, SearchInput, SkeletonRows, StatusBadge } from '../components/ui';
import { dateBR, dateTimeBR, money, norm, phone, whatsappLink } from '../utils/formats';
import { orderStatus } from '../utils/status';

const PER_PAGE = 25;
const pick = (c, ...keys) => keys.map((k) => c?.[k]).find((v) => v != null && v !== '');

const Clients = () => {
    const go = useGo();
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const page = Number(params.get('page')) || 1;
    const [open, setOpen] = useState(null);
    const set = (patch) => {
        const next = new URLSearchParams(params);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        setParams(next, { replace: true });
    };

    const { data, loading, error, reload } = useLoad(() => api.clients(), []);

    const list = useMemo(() => {
        const rows = (data || []).map((c) => {
            const orders = c.orders || [];
            return {
                ...c,
                _name: pick(c, 'name', 'Name') || '—',
                _email: pick(c, 'email', 'Email') || '',
                _orders: orders,
                _total: orders.filter((o) => orderStatus(o) !== 'cancelado').reduce((s, o) => s + (Number(o.total_value) || 0), 0),
            };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (!q) return rows;
        const t = norm(q);
        return rows.filter((c) => norm(`${c._name} ${c._email} ${c.Phone}`).includes(t));
    }, [data, q]);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <>
            <PageHeader title="Clientes" subtitle="Cadastros feitos no site. Clique num cliente para ver os pedidos dele." />
            <div className='filters'>
                <SearchInput value={q} onChange={(v) => set({ q: v, page: '' })} placeholder="Nome, e-mail ou telefone" />
            </div>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Cliente</th><th>Telefone</th><th>Cadastro</th><th className='r'>Pedidos</th><th className='r'>Total comprado</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={6} /> : shown.map((c) => (
                                    <React.Fragment key={c.id_client}>
                                        <tr className={`row-cursor ${open === c.id_client ? 'row-on' : ''}`} onClick={() => setOpen(open === c.id_client ? null : c.id_client)}>
                                            <td><strong>{c._name}</strong><br /><small className='muted'>{c._email}</small></td>
                                            <td className='nowrap'>{phone(c.Phone) || '—'}</td>
                                            <td>{dateBR(c.createdAt)}</td>
                                            <td className='r'>{c._orders.length}</td>
                                            <td className='r'>{money(c._total)}</td>
                                            <td className='r' onClick={(e) => e.stopPropagation()}>
                                                {c.Phone && <a className='btn-icon' href={whatsappLink(c.Phone, `Olá ${c._name}! Aqui é da Fechatudo.`)} target="_blank" rel="noreferrer" title="WhatsApp"><BsWhatsapp /></a>}
                                            </td>
                                        </tr>
                                        {open === c.id_client && (
                                            <tr className='row-detail'>
                                                <td colSpan={6}>
                                                    {c._orders.length ? (
                                                        <table className='tbl tbl-compact tbl-hover'>
                                                            <tbody>
                                                                {[...c._orders].sort((a, b) => b.id_order - a.id_order).map((o) => (
                                                                    <tr key={o.id_order} className='row-cursor' onClick={() => go(`/pedidos/${o.id_order}`)}>
                                                                        <td><strong>#{o.id_order}</strong></td>
                                                                        <td>{dateTimeBR(o.createdAt)}</td>
                                                                        <td><StatusBadge status={orderStatus(o)} /></td>
                                                                        <td className='r'>{money(o.total_value)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : <span className='muted'>Nenhum pedido ainda.</span>}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !shown.length && <EmptyState title="Nenhum cliente" />}
                    <Pagination page={page} pages={pages} total={list.length} label="clientes" onChange={(n) => set({ page: String(n) })} />
                </div>
            )}
        </>
    );
};

export default Clients;
