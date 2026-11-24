import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, Pagination, SearchInput, SkeletonRows, StatusBadge, Tabs } from '../components/ui';
import { dateTimeBR, money, norm, phone } from '../utils/formats';
import { orderStatus } from '../utils/status';

const PER_PAGE = 20;

const Orders = () => {
    const go = useGo();
    const [params, setParams] = useSearchParams();
    const tab = params.get('status') === 'concluidos' ? 'concluidos' : 'abertos';
    const q = params.get('q') || '';
    const page = Number(params.get('page')) || 1;
    const set = (patch) => {
        const next = new URLSearchParams(params);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        setParams(next, { replace: true });
    };

    const { data, loading, error, reload } = useLoad(
        () => (tab === 'concluidos' ? api.ordersFinished() : api.ordersPending()),
        [tab],
        { keep: false },
    );

    const list = useMemo(() => {
        const rows = [...(data || [])].sort((a, b) => b.id_order - a.id_order);
        if (!q) return rows;
        const t = norm(q);
        return rows.filter((o) => norm(`${o.id_order} ${o.clients?.name || o.clients?.Name} ${o.clients?.email || o.clients?.Email} ${o.clients?.Phone}`).includes(t));
    }, [data, q]);
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <>
            <PageHeader title="Pedidos" subtitle="Pedidos feitos no site. Clique para ver os itens e mudar a situação." />
            <Tabs value={tab} onChange={(k) => set({ status: k === 'abertos' ? '' : k, page: '' })}
                items={[{ key: 'abertos', label: 'Em aberto', count: tab === 'abertos' ? data?.length : undefined }, { key: 'concluidos', label: 'Concluídos' }]} />
            <div className='filters'>
                <SearchInput value={q} onChange={(v) => set({ q: v, page: '' })} placeholder="Nº do pedido, cliente, e-mail ou telefone" />
            </div>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead>
                                <tr><th>Pedido</th><th>Cliente</th><th>Pagamento</th><th>Itens</th><th>Situação</th><th className='r'>Total</th></tr>
                            </thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={6} /> : shown.map((o) => (
                                    <tr key={o.id_order} className='row-cursor' onClick={() => go(`/pedidos/${o.id_order}`)}>
                                        <td><strong>#{o.id_order}</strong><br /><small className='muted'>{dateTimeBR(o.createdAt)}</small></td>
                                        <td>{o.clients?.name || o.clients?.Name || '—'}<br /><small className='muted'>{phone(o.clients?.Phone)}</small></td>
                                        <td>{o.payment || '—'}</td>
                                        <td>{(o.buy_cart || []).length}</td>
                                        <td><StatusBadge status={orderStatus(o)} /></td>
                                        <td className='r'><strong>{money(o.total_value)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !shown.length && <EmptyState title="Nenhum pedido" text={q ? 'Nada encontrado com essa busca.' : undefined} />}
                    <Pagination page={page} pages={pages} total={list.length} label="pedidos" onChange={(n) => set({ page: String(n) })} />
                </div>
            )}
        </>
    );
};

export default Orders;
