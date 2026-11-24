import React from 'react';
import { Link } from 'react-router-dom';
import { BsReceipt, BsPeople, BsBoxSeam, BsBell, BsArrowRepeat, BsExclamationTriangle } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { ErrorState, KpiCard, PageHeader, Skeleton, StatusBadge } from '../components/ui';
import { dateTimeBR, money, timeAgo } from '../utils/formats';
import { orderStatus } from '../utils/status';

const Dashboard = () => {
    const go = useGo();
    const { data: d, loading, error, reload } = useLoad(() => api.dashboard(), []);

    if (error) return <ErrorState text={error} onRetry={reload} />;

    const k = (v) => (loading ? <Skeleton h={26} w={60} /> : v);
    const isales = d?.isales || {};

    return (
        <>
            <PageHeader title="Painel" subtitle="Resumo da loja e do que precisa de atenção" />

            <div className='kpis'>
                <KpiCard icon={<BsReceipt />} label="Pedidos em aberto" value={k(d?.pedidosPendentes)} hint={`${d?.pedidos30d ?? '…'} nos últimos 30 dias`}
                    tone={d?.pedidosPendentes ? 'warn' : undefined} onClick={() => go('/pedidos')} />
                <KpiCard icon={<BsPeople />} label="Clientes" value={k(d?.clientes)} hint={`${d?.clientes30d ?? '…'} novos em 30 dias`} onClick={() => go('/clientes')} />
                <KpiCard icon={<BsBoxSeam />} label="Produtos" value={k(d?.produtos)} hint={`${d?.produtosInativos ?? 0} inativos · ${d?.semFoto ?? 0} sem foto`} onClick={() => go('/produtos')} />
                <KpiCard icon={<BsBell />} label="Avisos de estoque" value={k(d?.avisosPendentes)} hint="clientes esperando produto chegar"
                    tone={d?.avisosPendentes ? 'warn' : undefined} onClick={() => go('/avisos-estoque')} />
            </div>

            <div className='grid-2'>
                <section className='card'>
                    <div className='card-head'>
                        <h2>Últimos pedidos</h2>
                        <Link to="/pedidos" className='btn-link'>Ver todos</Link>
                    </div>
                    {loading ? <Skeleton h={120} /> : (
                        <table className='tbl tbl-compact tbl-hover'>
                            <tbody>
                                {(d?.ultimosPedidos || []).map((o) => (
                                    <tr key={o.id_order} className='row-cursor' onClick={() => go(`/pedidos/${o.id_order}`)}>
                                        <td><strong>#{o.id_order}</strong><br /><small className='muted'>{o.client_name || 'Cliente'}</small></td>
                                        <td><StatusBadge status={orderStatus(o)} /></td>
                                        <td className='r'>{money(o.total_value)}<br /><small className='muted'>{dateTimeBR(o.createdAt)}</small></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <section className='card'>
                    <div className='card-head'>
                        <h2>Preço e estoque (iSales)</h2>
                        <Link to="/isales" className='btn-link'>Abrir</Link>
                    </div>
                    {loading ? <Skeleton h={120} /> : (
                        <div className='stack'>
                            <dl className='dl-grid'>
                                <dt>Sincronização automática</dt>
                                <dd className={isales.syncEnabled ? 'text-ok' : 'text-warn'}>{isales.syncEnabled ? 'Ligada' : 'Desligada no servidor'}</dd>
                                <dt>Última sincronização</dt>
                                <dd>{isales.lastSyncAt ? `${timeAgo(isales.lastSyncAt)} (${dateTimeBR(isales.lastSyncAt)})` : 'Ainda não rodou desde que o servidor iniciou'}</dd>
                                <dt>Produtos sem vínculo</dt>
                                <dd className={d?.semIsales ? 'text-warn' : 'text-ok'}>{d?.semIsales} (aparecem sem preço no site)</dd>
                                <dt>Vinculados sem estoque</dt>
                                <dd>{d?.semEstoque} (mostram "Avise-me quando chegar")</dd>
                            </dl>
                            {isales.lastSyncError && (
                                <div className='alert-err'><BsExclamationTriangle /> Última sincronização falhou: {isales.lastSyncError}</div>
                            )}
                            <div>
                                <button type="button" className='btn-ghost btn-sm' onClick={() => go('/isales')}><BsArrowRepeat /> Vincular produtos ou sincronizar agora</button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default Dashboard;
