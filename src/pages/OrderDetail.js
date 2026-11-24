import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BsWhatsapp, BsEnvelope, BsCheckCircle, BsXCircle } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { BackLink } from '../app/nav';
import api from '../api/admin';
import { siteUrl } from '../api/client';
import { ConfirmDialog, ErrorState, PageHeader, Skeleton, StatusBadge } from '../components/ui';
import { Field, Thumb, useAction } from '../components/form';
import { dateTimeBR, money, phone, productUrl, whatsappLink } from '../utils/formats';
import { ORDER_STEPS, orderStatus } from '../utils/status';

// Instalações escolhidas junto com o produto (gravadas como JSON no item do carrinho)
const parseComplement = (c) => {
    if (!c) return [];
    try {
        const v = typeof c === 'string' ? JSON.parse(c) : c;
        return (Array.isArray(v) ? v : [v]).filter(Boolean);
    } catch { return []; }
};

const OrderDetail = () => {
    const { id } = useParams();
    const { data: o, loading, error, reload } = useLoad(() => api.order(id), [id]);
    const [run, busy] = useAction();
    const [obs, setObs] = useState('');
    const [confirm, setConfirm] = useState(null);
    useEffect(() => { setObs(o?.observation || ''); }, [o]);

    if (error) return <><BackLink fallbackTo="/pedidos" fallbackLabel="Voltar para Pedidos" /><ErrorState text={error} onRetry={reload} /></>;
    if (loading || !o) return <Skeleton h={300} />;

    const status = orderStatus(o);
    const closed = status === 'finalizado' || status === 'cancelado';
    const next = ORDER_STEPS.find((s) => !o[s.field]);
    const client = o.clients || {};
    const items = o.buy_cart || [];

    const advance = (step) => run(() => api.updateOrder(o.id_order, { [step.field]: new Date().toISOString() }), 'Situação atualizada', reload);
    const cancel = () => run(() => api.updateOrder(o.id_order, { is_canceled_by_store: true }), 'Pedido cancelado', () => { setConfirm(null); return reload(); });
    const saveObs = () => run(() => api.updateOrder(o.id_order, { observation: obs }), 'Observação salva', reload);

    return (
        <>
            <BackLink fallbackTo="/pedidos" fallbackLabel="Voltar para Pedidos" />
            <PageHeader title={`Pedido #${o.id_order}`} subtitle={`Feito em ${dateTimeBR(o.createdAt)} · pagamento: ${o.payment || '—'}`}>
                <StatusBadge status={status} />
            </PageHeader>

            <div className='steps'>
                {[{ label: 'Recebido', done: true, at: o.createdAt }, ...ORDER_STEPS.map((s) => ({ label: s.label.replace(/^(Aprovar|Marcar como|Concluir) /, ''), done: !!o[s.field], at: o[s.field] }))]
                    .map((s) => (
                        <span key={s.label} className={`step ${s.done ? 'step-done' : ''}`} title={s.at ? dateTimeBR(s.at) : ''}>
                            {s.done ? <BsCheckCircle /> : null} {s.label}
                        </span>
                    ))}
            </div>

            <div className='grid-2'>
                <section className='card'>
                    <h2>Itens</h2>
                    <table className='tbl tbl-compact'>
                        <tbody>
                            {items.map((it) => {
                                const p = it.products || {};
                                const extras = parseComplement(it.complement);
                                return (
                                    <tr key={it.id_buy_cart}>
                                        <td>
                                            <div className='cell-prod'>
                                                <Thumb src={null} size={40} />
                                                <div>
                                                    <a href={siteUrl(productUrl(p))} target="_blank" rel="noreferrer"><strong>{p.Product_Name || `Produto ${it.Product_ID}`}</strong></a>
                                                    {extras.map((x, i) => <small key={i} className='d-block'>+ {x.Title || x.title || x.name || 'Instalação'} {x.Price ? `(${money(x.Price)})` : ''}</small>)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className='r nowrap'>{it.quantity} ×<br /><small className='muted'>{money(p.Price)}</small></td>
                                    </tr>
                                );
                            })}
                            <tr><td><strong>Total do pedido</strong></td><td className='r'><strong>{money(o.total_value)}</strong></td></tr>
                        </tbody>
                    </table>
                </section>

                <section className='card'>
                    <h2>Cliente</h2>
                    <dl className='dl-grid'>
                        <dt>Nome</dt><dd>{client.name || '—'}</dd>
                        <dt>E-mail</dt><dd>{client.email || '—'}</dd>
                        <dt>Telefone</dt><dd>{phone(client.Phone) || '—'}</dd>
                        <dt>Cliente desde</dt><dd>{dateTimeBR(client.createdAt)}</dd>
                    </dl>
                    <div className='form-row mt-3'>
                        {client.Phone && (
                            <a className='btn-success btn-sm' href={whatsappLink(client.Phone, `Olá ${client.name || ''}! Sobre o seu pedido #${o.id_order} na Fechatudo:`)} target="_blank" rel="noreferrer">
                                <BsWhatsapp /> WhatsApp
                            </a>
                        )}
                        {client.email && <a className='btn-ghost btn-sm' href={`mailto:${client.email}?subject=Pedido%20%23${o.id_order}%20-%20Fechatudo`}><BsEnvelope /> E-mail</a>}
                    </div>
                </section>
            </div>

            <section className='card'>
                <h2>Andamento</h2>
                {closed ? (
                    <p className='muted'>Pedido {status === 'cancelado' ? 'cancelado' : 'concluído'}.</p>
                ) : (
                    <div className='form-row'>
                        {next && <button type="button" className='btn-primary' disabled={busy} onClick={() => advance(next)}><BsCheckCircle /> {next.label}</button>}
                        {next?.key !== 'finalizado' && (
                            <button type="button" className='btn-ghost' disabled={busy} onClick={() => advance(ORDER_STEPS[ORDER_STEPS.length - 1])}>Concluir direto</button>
                        )}
                        <button type="button" className='btn-danger-ghost' disabled={busy} onClick={() => setConfirm('cancel')}><BsXCircle /> Cancelar pedido</button>
                    </div>
                )}
                <Field label="Observação interna">
                    <textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: instalação agendada para sexta às 14h" />
                </Field>
                <button type="button" className='btn-ghost btn-sm' disabled={busy || obs === (o.observation || '')} onClick={saveObs}>Salvar observação</button>
            </section>

            <ConfirmDialog show={confirm === 'cancel'} title={`Cancelar pedido #${o.id_order}?`} tone="danger" confirmLabel="Cancelar pedido"
                busy={busy} onCancel={() => setConfirm(null)} onConfirm={cancel}>
                <p>O pedido sai da lista de pedidos em aberto. Avise o cliente pelo WhatsApp ou e-mail.</p>
            </ConfirmDialog>
        </>
    );
};

export default OrderDetail;
