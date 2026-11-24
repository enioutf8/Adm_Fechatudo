import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BsPlusLg, BsBoxArrowUpRight } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import { useGo } from '../app/nav';
import api from '../api/admin';
import { siteUrl } from '../api/client';
import { EmptyState, ErrorState, PageHeader, Pagination, SearchInput, SkeletonRows } from '../components/ui';
import { Thumb } from '../components/form';
import { money, norm, productUrl } from '../utils/formats';

const PER_PAGE = 30;

const Products = () => {
    const go = useGo();
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const cat = params.get('cat') || '';
    const brand = params.get('marca') || '';
    const flag = params.get('filtro') || '';
    const page = Number(params.get('page')) || 1;
    const set = (patch) => {
        const next = new URLSearchParams(params);
        Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        if (!('page' in patch)) next.delete('page');
        setParams(next, { replace: true });
    };

    const { data, loading, error, reload } = useLoad(() => api.adminProducts(), []);
    const all = useMemo(() => data || [], [data]);
    const categories = useMemo(() => [...new Set(all.map((p) => p.category).filter(Boolean))].sort(), [all]);
    const brands = useMemo(() => [...new Set(all.map((p) => p.brand).filter(Boolean))].sort(), [all]);
    const suppliers = useMemo(() => [...new Set(all.map((p) => p.supplier).filter(Boolean))].sort(), [all]);
    const supplier = params.get('fornecedor') || '';
    // Abaixo do estoque mínimo cadastrado no iSales - Api
    const lowStock = (p) => p.isales_id && p.minStock != null && p.minStock > 0 && Math.max(0, Number(p.Quantity) || 0) <= p.minStock;

    const list = useMemo(() => {
        const t = norm(q);
        return all.filter((p) => {
            if (t && !norm(`${p.Product_Name} ${p.brand} ${p.Product_ID}`).includes(t)) return false;
            if (cat && p.category !== cat) return false;
            if (brand && p.brand !== brand) return false;
            if (supplier && p.supplier !== supplier) return false;
            if (flag === 'repor' && !lowStock(p)) return false;
            if (flag === 'inativos' && p.Is_Active) return false;
            if (flag === 'sem-foto' && Number(p.photos) > 0) return false;
            if (flag === 'sem-isales' && p.isales_id) return false;
            if (flag === 'sem-estoque' && !(p.isales_id && Number(p.Quantity) <= 0)) return false;
            return true;
        });
    }, [all, q, cat, brand, supplier, flag]); // eslint-disable-line react-hooks/exhaustive-deps
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <>
            <PageHeader title="Produtos" subtitle="Catálogo do site. Preço e estoque dos produtos vinculados vêm do iSales - Api.">
                <button type="button" className='btn-primary' onClick={() => go('/produtos/novo')}><BsPlusLg /> Novo produto</button>
            </PageHeader>
            <div className='filters'>
                <SearchInput value={q} onChange={(v) => set({ q: v })} placeholder="Nome, marca ou código" />
                <select value={cat} onChange={(e) => set({ cat: e.target.value })} aria-label="Categoria">
                    <option value="">Todas as categorias</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={brand} onChange={(e) => set({ marca: e.target.value })} aria-label="Marca">
                    <option value="">Todas as marcas</option>
                    {brands.map((b) => <option key={b}>{b}</option>)}
                </select>
                <select value={supplier} onChange={(e) => set({ fornecedor: e.target.value })} aria-label="Fornecedor">
                    <option value="">Todos os fornecedores</option>
                    {suppliers.map((x) => <option key={x}>{x}</option>)}
                </select>
                <select value={flag} onChange={(e) => set({ filtro: e.target.value })} aria-label="Situação">
                    <option value="">Todas as situações</option>
                    <option value="sem-isales">Sem vínculo com iSales - Api (sem preço no site)</option>
                    <option value="sem-estoque">Sem estoque</option>
                    <option value="repor">Abaixo do estoque mínimo (repor)</option>
                    <option value="sem-foto">Sem foto</option>
                    <option value="inativos">Inativos</option>
                </select>
            </div>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Produto</th><th>Categoria</th><th className='r'>Preço</th><th className='r'>Estoque</th><th>Fornecedor</th><th>iSales - Api</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={7} /> : shown.map((p) => (
                                    <tr key={p.Product_ID} className='row-cursor' onClick={() => go(`/produtos/${p.Product_ID}`)}>
                                        <td>
                                            <div className='cell-prod'>
                                                <Thumb src={p.photo} size={48} contain />
                                                <div>
                                                    <strong>{p.Product_Name}</strong>
                                                    <small>{p.brand || 'Sem marca'} · #{p.Product_ID}{!p.Is_Active && <span className='pill pill-warn ms-1'>Inativo</span>}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.category}<br /><small className='muted'>{p.sub_category}</small></td>
                                        <td className='r nowrap'>{p.isales_id || p.category === 'Serviços' ? money(p.Price) : <span className='muted' title="Sem vínculo com o iSales - Api: o site não mostra preço">—</span>}</td>
                                        <td className='r'>
                                            {p.isales_id ? <span className={Number(p.Quantity) > 0 ? 'stock-ok' : 'stock-no'}>{Math.max(0, Number(p.Quantity) || 0)}</span> : <span className='muted'>—</span>}
                                            {p.minStock != null && <small className={`d-block ${lowStock(p) ? 'text-danger' : 'muted'}`}>mín. {p.minStock}{lowStock(p) ? ' · repor' : ''}</small>}
                                        </td>
                                        <td><small>{p.supplier || '—'}</small></td>
                                        <td>{p.isales_id ? <span className='pill pill-1'>#{p.isales_id}</span> : <span className='pill pill-warn'>Sem vínculo</span>}</td>
                                        <td className='r' onClick={(e) => e.stopPropagation()}>
                                            <a className='btn-icon' href={siteUrl(productUrl(p))} target="_blank" rel="noreferrer" title="Ver no site"><BsBoxArrowUpRight /></a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !shown.length && <EmptyState title="Nenhum produto" text="Ajuste a busca ou os filtros." />}
                    <Pagination page={page} pages={pages} total={list.length} label="produtos" onChange={(n) => set({ page: String(n) })} />
                </div>
            )}
        </>
    );
};

export default Products;
