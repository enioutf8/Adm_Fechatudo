import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsArrowRepeat, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { EmptyState, ErrorState, KpiCard, PageHeader, SearchInput, SkeletonRows, Tabs } from '../components/ui';
import { Thumb, useAction } from '../components/form';
import IsalesLinker from '../components/IsalesLinker';
import { dateTimeBR, money, timeAgo } from '../utils/formats';

const Isales = () => {
    const go = useGo();
    const [params, setParams] = useSearchParams();
    const tab = params.get('aba') === 'vinculados' ? 'vinculados' : 'pendentes';
    const q = params.get('q') || '';
    const [open, setOpen] = useState(null);
    const [run, busy] = useAction();
    const status = useLoad(() => api.isalesStatus(), []);
    const { data, loading, error, reload } = useLoad(() => api.isalesProducts(tab === 'vinculados', q), [tab, q], { keep: false });
    const s = status.data || {};

    const sync = () => run(() => api.isalesSync(), null, (r) => {
        const msg = `Sincronizado: ${r.sync.updated}/${r.sync.checked} produtos${r.sync.skipped.length ? `, ${r.sync.skipped.length} pulados` : ''}. Avisos de estoque enviados: ${r.alerts.sent}.`;
        alert(msg);
        status.reload(); reload();
    });

    return (
        <>
            <PageHeader title="iSales - Api" subtitle="Preço, estoque e especificações dos produtos vêm do iSales - Api. Aqui você liga cada produto do site ao item correspondente.">
                <button type="button" className='btn-primary' onClick={sync} disabled={busy}><BsArrowRepeat /> {busy ? 'Sincronizando…' : 'Sincronizar agora'}</button>
            </PageHeader>

            <div className='kpis'>
                <KpiCard label="Vinculados" value={s.linked ?? '…'} hint="com preço e estoque do iSales - Api" />
                <KpiCard label="Sem vínculo" value={s.unlinked ?? '…'} hint="aparecem sem preço no site" tone={s.unlinked ? 'warn' : undefined} />
                <KpiCard label="Sincronização automática" value={s.syncEnabled ? `a cada ${s.syncMinutes} min` : 'Desligada'}
                    hint={s.syncEnabled ? 'ligada no servidor' : 'ligue com ISALES_SYNC_ENABLED=true no .env do servidor'} tone={s.syncEnabled ? undefined : 'warn'} />
                <KpiCard label="Última sincronização" value={s.lastSyncAt ? timeAgo(s.lastSyncAt) : '—'} hint={s.lastSyncError ? `Falhou: ${s.lastSyncError}` : s.lastSyncAt ? dateTimeBR(s.lastSyncAt) : 'desde que o servidor iniciou'}
                    tone={s.lastSyncError ? 'danger' : undefined} />
            </div>

            <Tabs value={tab} onChange={(k) => { setOpen(null); setParams({ aba: k }, { replace: true }); }}
                items={[{ key: 'pendentes', label: 'Sem vínculo', count: s.unlinked }, { key: 'vinculados', label: 'Vinculados', count: s.linked }]} />
            <div className='filters'>
                <SearchInput value={q} onChange={(v) => setParams((p) => { const n = new URLSearchParams(p); v ? n.set('q', v) : n.delete('q'); return n; }, { replace: true })} placeholder="Produto ou marca" />
            </div>

            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Produto do site</th><th>{tab === 'vinculados' ? 'Item do iSales - Api' : 'Categoria'}</th><th className='r'>Preço</th><th className='r'>Estoque</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={5} /> : (data || []).map((p) => (
                                    <React.Fragment key={p.Product_ID}>
                                        <tr className={`row-cursor ${open === p.Product_ID ? 'row-on' : ''}`} onClick={() => setOpen(open === p.Product_ID ? null : p.Product_ID)}>
                                            <td>
                                                <div className='cell-prod'>
                                                    <Thumb src={p.photo} size={44} contain />
                                                    <div><strong>{p.Product_Name}</strong><small>{p.brand || 'Sem marca'} · #{p.Product_ID}</small></div>
                                                </div>
                                            </td>
                                            <td>{tab === 'vinculados'
                                                ? (p.isales ? <><span>{p.isales.name}</span><br /><small className='muted'>#{p.isales.id} · {p.isales.ean}</small></> : <span className='text-danger'>#{p.isales_id} não encontrado no iSales - Api</span>)
                                                : p.sub_category}</td>
                                            <td className='r'>{tab === 'vinculados' ? money(p.Price) : <span className='muted'>—</span>}</td>
                                            <td className='r'>{tab === 'vinculados' ? <span className={Number(p.Quantity) > 0 ? 'stock-ok' : 'stock-no'}>{Math.max(0, Number(p.Quantity) || 0)}</span> : <span className='muted'>—</span>}</td>
                                            <td className='r'>{open === p.Product_ID ? <BsChevronUp /> : <BsChevronDown />}</td>
                                        </tr>
                                        {open === p.Product_ID && (
                                            <tr className='row-detail'>
                                                <td colSpan={5}>
                                                    <IsalesLinker product={p} onChange={() => { setOpen(null); status.reload(); reload(); }} />
                                                    <button type="button" className='btn-link mt-2' onClick={() => go(`/produtos/${p.Product_ID}`)}>Abrir cadastro do produto</button>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !(data || []).length && (
                        <EmptyState title={tab === 'pendentes' ? 'Todos os produtos estão vinculados' : 'Nenhum produto vinculado'} text={q ? 'Nada encontrado com essa busca.' : undefined} />
                    )}
                </div>
            )}
        </>
    );
};

export default Isales;
