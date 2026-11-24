import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsWhatsapp, BsEnvelope, BsCheck2, BsArrowCounterclockwise, BsSend } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { siteUrl } from '../api/client';
import { EmptyState, ErrorState, PageHeader, SkeletonRows, Tabs } from '../components/ui';
import { DeleteButton, useAction } from '../components/form';
import { dateTimeBR, phone, productUrl, whatsappLink } from '../utils/formats';

// Pedidos de "Avise-me quando chegar". O e-mail sai sozinho quando o produto volta;
// quem pediu só por WhatsApp é avisado pela loja (botão abaixo) e marcado como avisado.
const StockAlerts = () => {
    const [params, setParams] = useSearchParams();
    const tab = params.get('status') || 'pending';
    const { data, loading, error, reload } = useLoad(() => api.stockAlerts(tab), [tab], { keep: false });
    const [run, busy] = useAction();

    const msg = (a) => `Olá${a.client_name ? ` ${a.client_name.split(' ')[0]}` : ''}! O produto que você pediu para ser avisado chegou na Fechatudo: ${a.Product_Name} — ${siteUrl(productUrl(a))}`;

    return (
        <>
            <PageHeader title="Avisos de estoque" subtitle="Clientes que pediram para ser avisados quando um produto chegar.">
                <button type="button" className='btn-ghost' disabled={busy}
                    onClick={() => run(() => api.sendStockAlerts(), null, (r) => { alert(`E-mails enviados: ${r.sent}. Com erro: ${r.failed}.${r.waiting ? ` ${r.waiting} aguardando: o e-mail (SMTP) não está configurado no servidor.` : ''}`); return reload(); })}>
                    <BsSend /> Enviar e-mails agora
                </button>
            </PageHeader>
            <Tabs value={tab} onChange={(k) => setParams({ status: k }, { replace: true })}
                items={[{ key: 'pending', label: 'Aguardando' }, { key: 'notified', label: 'Avisados' }, { key: 'all', label: 'Todos' }]} />
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Produto</th><th>Cliente</th><th>Contato</th><th>Pedido em</th><th>Situação</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={6} /> : (data || []).map((a) => (
                                    <tr key={a.id_stock_alert}>
                                        <td><a href={siteUrl(productUrl(a))} target="_blank" rel="noreferrer"><strong>{a.Product_Name}</strong></a></td>
                                        <td>{a.client_name || `Cliente #${a.id_client}`}</td>
                                        <td className='nowrap'>
                                            {a.email && <><BsEnvelope /> {a.email}<br /></>}
                                            {a.whatsapp && <><BsWhatsapp /> {phone(a.whatsapp)}</>}
                                        </td>
                                        <td>{dateTimeBR(a.createdAt)}</td>
                                        <td>
                                            {a.notified_at
                                                ? <span className='pill pill-1'>Avisado {dateTimeBR(a.notified_at)}</span>
                                                : Number(a.disponivel) ? <span className='pill pill-warn'>Produto disponível — avisar</span> : <span className='pill'>Aguardando chegar</span>}
                                            {a.notify_error && <small className='d-block text-danger'>Erro no e-mail: {a.notify_error}</small>}
                                        </td>
                                        <td>
                                            <div className='row-actions'>
                                                {a.whatsapp && !a.notified_at && (
                                                    <a className='btn-icon' href={whatsappLink(a.whatsapp, msg(a))} target="_blank" rel="noreferrer" title="Avisar pelo WhatsApp"><BsWhatsapp /></a>
                                                )}
                                                {a.notified_at
                                                    ? <button type="button" className='btn-icon' title="Voltar para aguardando" disabled={busy} onClick={() => run(() => api.setStockAlertNotified(a.id_stock_alert, false), 'Aviso reaberto', reload)}><BsArrowCounterclockwise /></button>
                                                    : <button type="button" className='btn-icon' title="Marcar como avisado" disabled={busy} onClick={() => run(() => api.setStockAlertNotified(a.id_stock_alert, true), 'Marcado como avisado', reload)}><BsCheck2 /></button>}
                                                <DeleteButton what="este aviso" onConfirm={() => api.deleteStockAlert(a.id_stock_alert)} after={reload} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !(data || []).length && <EmptyState title="Nenhum aviso" text={tab === 'pending' ? 'Nenhum cliente esperando produto no momento.' : undefined} />}
                </div>
            )}
        </>
    );
};

export default StockAlerts;
