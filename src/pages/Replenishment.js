import React, { useMemo, useState } from 'react';
import { BsArrowClockwise, BsBoxArrowUpRight } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { EmptyState, ErrorState, KpiCard, PageHeader, SearchInput, Skeleton } from '../components/ui';
import { money, norm } from '../utils/formats';

// O que comprar: itens do iSales - Api com estoque igual ou abaixo do mínimo cadastrado lá, por fornecedor
const Replenishment = () => {
    const go = useGo();
    const [refresh, setRefresh] = useState(0);
    const { data, loading, error, reload } = useLoad(() => api.replenishment(refresh > 0), [refresh]);
    const [q, setQ] = useState('');
    const [onlySite, setOnlySite] = useState(false);

    const groups = useMemo(() => {
        const t = norm(q);
        const list = (data || []).filter((i) => (!t || norm(`${i.name} ${i.ean} ${i.supplier}`).includes(t)) && (!onlySite || i.site.length));
        const map = new Map();
        list.forEach((i) => { const k = i.supplier || 'Sem fornecedor'; map.set(k, [...(map.get(k) || []), i]); });
        return [...map.entries()];
    }, [data, q, onlySite]);

    const total = (data || []).length;
    const zerados = (data || []).filter((i) => (i.stock ?? 0) <= 0).length;
    const noSite = (data || []).filter((i) => i.site.length).length;

    return (
        <>
            <PageHeader title="Reposição" subtitle="Itens com estoque igual ou abaixo do mínimo cadastrado no iSales - Api, agrupados por fornecedor.">
                <button type="button" className='btn-ghost' onClick={() => setRefresh((n) => n + 1)} disabled={loading}><BsArrowClockwise /> Atualizar do iSales - Api</button>
            </PageHeader>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <>
                    <div className='kpis'>
                        <KpiCard label="Itens para repor" value={loading ? '…' : total} tone={total ? 'warn' : undefined} />
                        <KpiCard label="Sem estoque" value={loading ? '…' : zerados} tone={zerados ? 'danger' : undefined} />
                        <KpiCard label="Vendidos no site" value={loading ? '…' : noSite} hint="desses itens, aparecem na loja" />
                    </div>
                    <div className='filters'>
                        <SearchInput value={q} onChange={setQ} placeholder="Produto, código ou fornecedor" />
                        <label className='check mb-0'><input type="checkbox" checked={onlySite} onChange={(e) => setOnlySite(e.target.checked)} /> Só os que estão no site</label>
                    </div>
                    {loading ? <Skeleton h={300} /> : !groups.length ? (
                        <EmptyState title="Nada para repor" text="Nenhum item está abaixo do estoque mínimo cadastrado no iSales - Api." />
                    ) : groups.map(([supplier, items]) => (
                        <section key={supplier} className='card card-flush'>
                            <div className='card-head' style={{ padding: '14px 16px 0' }}>
                                <h2>{supplier}</h2>
                                <small className='muted'>{items.length} item(ns)</small>
                            </div>
                            <div className='tbl-wrap'>
                                <table className='tbl tbl-compact tbl-hover'>
                                    <thead><tr><th>Item</th><th className='r'>Estoque</th><th className='r'>Mínimo</th><th className='r'>Faltam</th><th className='r'>Preço</th><th>No site</th></tr></thead>
                                    <tbody>
                                        {items.map((i) => (
                                            <tr key={i.id}>
                                                <td><strong>{i.name}</strong><small className='d-block muted'>#{i.id} · {i.ean}{i.ncm ? ` · NCM ${i.ncm}` : ''}</small></td>
                                                <td className={`r ${(i.stock ?? 0) <= 0 ? 'text-danger' : 'text-warn'}`}><strong>{Math.max(0, i.stock ?? 0)}</strong>{(i.stock ?? 0) < 0 && <small className='d-block'>({i.stock})</small>}</td>
                                                <td className='r'>{i.minStock}</td>
                                                <td className='r'><strong>{i.missing}</strong></td>
                                                <td className='r nowrap'>{money(i.price)}</td>
                                                <td>
                                                    {i.site.length ? i.site.map((p) => (
                                                        <button key={p.Product_ID} type="button" className='btn-link d-block text-start' onClick={() => go(`/produtos/${p.Product_ID}`)}>
                                                            <BsBoxArrowUpRight /> #{p.Product_ID}
                                                        </button>
                                                    )) : <small className='muted'>—</small>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </>
            )}
        </>
    );
};

export default Replenishment;
