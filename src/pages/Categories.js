import React, { useState } from 'react';
import { BsPlusLg, BsCheck2, BsPencil } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../components/ui';
import { DeleteButton, useAction } from '../components/form';
import { toNumber } from '../utils/formats';

// Linha editável: nome + desconto (%)
const EditRow = ({ item, onSave, onCancel, busy, placeholder }) => {
    const [label, setLabel] = useState(item?.label || '');
    const [disc, setDisc] = useState(Number(item?.Unit_Discount) ? String(Number(item.Unit_Discount)) : '');
    return (
        <form className='elist-row' onSubmit={(e) => { e.preventDefault(); if (label.trim()) onSave({ label: label.trim(), Unit_Discount: toNumber(disc) }); }}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={placeholder} autoFocus />
            <input value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="Desconto %" inputMode="decimal" style={{ maxWidth: 120 }} />
            <button type="submit" className='btn-primary btn-sm' disabled={busy || !label.trim()}><BsCheck2 /> Salvar</button>
            {onCancel && <button type="button" className='btn-ghost btn-sm' onClick={onCancel}>Cancelar</button>}
        </form>
    );
};

const Categories = () => {
    const { data, loading, error, reload } = useLoad(() => api.categories(), []);
    const [editing, setEditing] = useState(null); // 'new-cat' | 'cat-1' | 'new-sub-1' | 'sub-5'
    const [run, busy] = useAction();
    const done = () => { setEditing(null); return reload(); };

    if (error) return <ErrorState text={error} onRetry={reload} />;

    return (
        <>
            <PageHeader title="Categorias" subtitle="Organizam o catálogo, os menus e as buscas do site. O desconto (%) vale para todos os produtos da categoria.">
                <button type="button" className='btn-primary' onClick={() => setEditing('new-cat')}><BsPlusLg /> Nova categoria</button>
            </PageHeader>
            {editing === 'new-cat' && (
                <section className='card'>
                    <EditRow placeholder="Nome da categoria" busy={busy} onCancel={() => setEditing(null)}
                        onSave={(v) => run(() => api.createCategory(v), 'Categoria criada', done)} />
                </section>
            )}
            {loading ? <Skeleton h={240} /> : !(data || []).length ? <EmptyState title="Nenhuma categoria" /> : (data || []).map((c) => (
                <section key={c.id_category} className='card'>
                    {editing === `cat-${c.id_category}` ? (
                        <EditRow item={c} busy={busy} onCancel={() => setEditing(null)}
                            onSave={(v) => run(() => api.updateCategory(c.id_category, v), 'Categoria salva', done)} />
                    ) : (
                        <div className='card-head'>
                            <h2>{c.label} {Number(c.Unit_Discount) > 0 && <span className='pill pill-warn'>{Number(c.Unit_Discount)}% off</span>}</h2>
                            <div className='row-actions'>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => setEditing(`cat-${c.id_category}`)}><BsPencil /></button>
                                <DeleteButton what={`a categoria "${c.label}"`} effect="Só é possível excluir categorias sem subcategorias e sem produtos."
                                    onConfirm={() => api.deleteCategory(c.id_category)} after={reload} />
                            </div>
                        </div>
                    )}
                    <div className='elist mt-2'>
                        {(c.sub_category || []).map((s) => (
                            editing === `sub-${s.id_sub_category}` ? (
                                <EditRow key={s.id_sub_category} item={s} busy={busy} onCancel={() => setEditing(null)}
                                    onSave={(v) => run(() => api.updateSubCategory(s.id_sub_category, v), 'Subcategoria salva', done)} />
                            ) : (
                                <div key={s.id_sub_category} className='elist-row'>
                                    <span style={{ flex: 1 }}>{s.label} {Number(s.Unit_Discount) > 0 && <span className='pill pill-warn'>{Number(s.Unit_Discount)}% off</span>}</span>
                                    <button type="button" className='btn-icon' title="Editar" onClick={() => setEditing(`sub-${s.id_sub_category}`)}><BsPencil /></button>
                                    <DeleteButton what={`a subcategoria "${s.label}"`} effect="Só é possível excluir subcategorias sem produtos."
                                        onConfirm={() => api.deleteSubCategory(s.id_sub_category)} after={reload} />
                                </div>
                            )
                        ))}
                        {editing === `new-sub-${c.id_category}` ? (
                            <EditRow placeholder="Nome da subcategoria" busy={busy} onCancel={() => setEditing(null)}
                                onSave={(v) => run(() => api.createSubCategory({ ...v, id_category: c.id_category }), 'Subcategoria criada', done)} />
                        ) : (
                            <div><button type="button" className='btn-link' onClick={() => setEditing(`new-sub-${c.id_category}`)}><BsPlusLg /> Adicionar subcategoria</button></div>
                        )}
                    </div>
                </section>
            ))}
        </>
    );
};

export default Categories;
