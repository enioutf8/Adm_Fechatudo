import React, { useEffect, useMemo, useState } from 'react';
import { BsArrowRepeat, BsXLg } from 'react-icons/bs';
import api from '../api/admin';
import { assetUrl, errMsg } from '../api/client';
import { ConfirmDialog, EmptyState, SearchInput, Skeleton } from './ui';
import { useAction } from './form';
import { money } from '../utils/formats';

// Palavras úteis do nome do produto para a busca inicial (marca/modelo), sem termos genéricos
const STOP = new Set(['fechadura', 'digital', 'de', 'para', 'com', 'e', 'porta', 'portas', 'sobrepor', 'embutir', 'inteligente', 'smart', 'preta', 'preto', 'cor', 'a', 'o', 'por', 'em']);
const suggestQuery = (name) => String(name || '')
    .split(/[\s,–\-|/()]+/)
    .filter((w) => w.length > 1 && !STOP.has(w.toLowerCase()))
    .slice(0, 3)
    .join(' ');

const IsalesCard = ({ item, onPick, current }) => (
    <button type="button" className='isl-card' onClick={onPick ? () => onPick(item) : undefined} disabled={!onPick}>
        {item.picture ? <img src={item.picture} alt="" loading="lazy" /> : <span className='thumb thumb-empty' />}
        <strong>{item.name}</strong>
        <small>#{item.id} · {item.ean || 'sem código'}{item.brand ? ` · ${item.brand}` : ''}</small>
        <small>
            <strong className='text-dark'>{item.price != null ? money(item.price) : '—'}</strong>
            {' · '}
            <span className={item.stock > 0 ? 'text-ok' : 'text-danger'}>estoque {item.stock != null ? Math.max(0, item.stock) : '—'}</span>
            {!item.active && ' · inativo'}
        </small>
        {item.linkedCount > 0 && !current && <small className='text-warn'>Já vinculado a {item.linkedCount} produto(s) do site</small>}
    </button>
);

/**
 * Vincula um produto do site a um produto do iSales (preço, estoque e especificações passam a vir de lá).
 * product: { Product_ID, Product_Name, isales_id, photo|photos }
 */
const IsalesLinker = ({ product, onChange }) => {
    const [q, setQ] = useState(() => suggestQuery(product.Product_Name));
    const [results, setResults] = useState(null);
    const [current, setCurrent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [run, busy] = useAction();
    const sitePhoto = product.photo || product.photos?.[0]?.url;

    // Produto do iSales já vinculado
    useEffect(() => {
        let alive = true;
        setCurrent(null);
        if (!product.isales_id) return undefined;
        api.isalesItem(product.isales_id).then((list) => {
            if (alive) setCurrent(list?.[0] || { id: product.isales_id, name: `Produto #${product.isales_id} (não encontrado no iSales)` });
        }).catch(() => alive && setCurrent({ id: product.isales_id, name: `Produto #${product.isales_id}` }));
        return () => { alive = false; };
    }, [product.isales_id]);

    useEffect(() => {
        let alive = true;
        setLoading(true); setError('');
        api.isalesCatalog(q).then((r) => alive && setResults(r)).catch((e) => alive && setError(errMsg(e))).finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [q]);

    const shown = useMemo(() => (results || []).filter((r) => r.id !== Number(product.isales_id)), [results, product.isales_id]);

    const link = () => run(() => api.linkIsales(product.Product_ID, confirm.id), 'Vínculo salvo: preço e estoque atualizados', () => { setConfirm(null); return onChange?.(); });
    const unlink = () => run(() => api.unlinkIsales(product.Product_ID), 'Vínculo removido', () => { setConfirm(null); return onChange?.(); });

    return (
        <div className='stack'>
            <div className='cmp'>
                <div className='cmp-side'>
                    <h3>No site</h3>
                    {sitePhoto ? <img className='cmp-img' src={assetUrl(sitePhoto)} alt="" /> : <div className='cmp-img' />}
                    <strong className='d-block mt-2'>{product.Product_Name}</strong>
                    <small className='muted'>#{product.Product_ID}</small>
                </div>
                <div className='cmp-side'>
                    <h3>No iSales</h3>
                    {product.isales_id ? (
                        current ? (
                            <>
                                {current.picture ? <img className='cmp-img' src={current.picture} alt="" /> : <div className='cmp-img' />}
                                <strong className='d-block mt-2'>{current.name}</strong>
                                <small className='muted d-block'>#{current.id} · {current.ean}</small>
                                <small className='d-block'>{money(current.price)} · estoque {Math.max(0, Number(current.stock) || 0)}</small>
                                <button type="button" className='btn-danger-ghost btn-sm mt-2' disabled={busy} onClick={() => setConfirm('unlink')}><BsXLg /> Remover vínculo</button>
                            </>
                        ) : <Skeleton h={180} />
                    ) : <EmptyState title="Sem vínculo" text="Escolha abaixo o produto correspondente no iSales. Sem vínculo, o site não mostra preço." />}
                </div>
            </div>

            <div>
                <div className='filters'>
                    <SearchInput value={q} onChange={setQ} placeholder="Buscar no iSales por nome, modelo, marca ou código" />
                    <button type="button" className='btn-ghost btn-sm' onClick={() => api.isalesCatalog(q, true).then(setResults)} title="Recarregar catálogo do iSales"><BsArrowRepeat /> Atualizar</button>
                </div>
                {error && <div className='alert-err'>{error}</div>}
                {loading && !results ? <Skeleton h={160} /> : shown.length ? (
                    <div className='isl'>
                        {shown.map((item) => <IsalesCard key={item.id} item={item} onPick={setConfirm} />)}
                    </div>
                ) : (results || []).length ? (
                    <p className='muted'>O único resultado desta busca já é o item vinculado. Busque outro termo para trocar o vínculo.</p>
                ) : <EmptyState title="Nada encontrado no iSales" text="Tente o modelo (ex.: FR 102), a marca ou o código de barras." />}
            </div>

            <ConfirmDialog show={!!confirm && confirm !== 'unlink'} title="Vincular ao iSales?" confirmLabel="Vincular" busy={busy}
                onCancel={() => setConfirm(null)} onConfirm={link}>
                {confirm && confirm !== 'unlink' && (
                    <>
                        <div className='cmp'>
                            <div className='cmp-side'><h3>Site</h3>{sitePhoto && <img className='cmp-img' src={assetUrl(sitePhoto)} alt="" />}<small>{product.Product_Name}</small></div>
                            <div className='cmp-side'><h3>iSales</h3>{confirm.picture && <img className='cmp-img' src={confirm.picture} alt="" />}<small>{confirm.name}</small></div>
                        </div>
                        <p className='mt-3'>O preço passa a ser <strong>{money(confirm.price)}</strong> e o estoque <strong>{Math.max(0, Number(confirm.stock) || 0)}</strong>, atualizados automaticamente.</p>
                        {confirm.linkedCount > 0 && <p className='text-warn'>Este item do iSales já está vinculado a {confirm.linkedCount} produto(s) do site — eles vão dividir o mesmo estoque.</p>}
                    </>
                )}
            </ConfirmDialog>
            <ConfirmDialog show={confirm === 'unlink'} title="Remover vínculo?" tone="danger" confirmLabel="Remover" busy={busy}
                onCancel={() => setConfirm(null)} onConfirm={unlink}>
                <p>O produto deixa de mostrar preço no site e passa a exibir "Avise-me quando chegar".</p>
            </ConfirmDialog>
        </div>
    );
};

export default IsalesLinker;
