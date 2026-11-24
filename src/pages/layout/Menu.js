import React, { useState } from 'react';
import { BsPlusLg, BsCheck2, BsPencil } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui';
import { DeleteButton, Switch, useAction } from '../../components/form';

// Linha editável de menu/submenu: nome, link e ativo
const MenuRow = ({ item, onSave, onCancel, busy, placeholder = 'Nome' }) => {
    const [label, setLabel] = useState(item?.label || '');
    const [url, setUrl] = useState(item?.url || '');
    const [active, setActive] = useState(item ? !!item.active : true);
    return (
        <form className='elist-row' onSubmit={(e) => { e.preventDefault(); if (label.trim()) onSave({ label: label.trim(), url: url.trim(), active: active ? 1 : 0 }); }}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={placeholder} autoFocus />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link (ex.: /search?search=Digital)" />
            <Switch checked={active} onChange={setActive} label="Ativo" />
            <button type="submit" className='btn-primary btn-sm' disabled={busy || !label.trim()}><BsCheck2 /> Salvar</button>
            {onCancel && <button type="button" className='btn-ghost btn-sm' onClick={onCancel}>Cancelar</button>}
        </form>
    );
};

// Menu do cabeçalho e do rodapé do site
const Menu = () => {
    const { data, loading, error, reload } = useLoad(() => api.menus(), []);
    const [editing, setEditing] = useState(null);
    const [run, busy] = useAction();
    const done = () => { setEditing(null); return reload(); };

    const saveMenu = (menu, v) => run(() => api.updateMenu({ id_layout_navbar: menu.id_layout_navbar, ...v, subMenus: [] }), 'Menu salvo', done);
    const saveSub = (menu, sub, v) => run(() => api.updateMenu({
        id_layout_navbar: menu.id_layout_navbar, label: menu.label, url: menu.url, active: menu.active,
        subMenus: [{ ...sub, ...v, id_layout_navbar: menu.id_layout_navbar }],
    }), 'Submenu salvo', done);

    if (error) return <ErrorState text={error} onRetry={reload} />;

    return (
        <>
            <PageHeader title="Menu" subtitle="Itens do menu principal (cabeçalho) e do rodapé. Os menus de categorias, serviços e catálogo são montados automaticamente.">
                <button type="button" className='btn-primary' onClick={() => setEditing('new')}><BsPlusLg /> Novo menu</button>
            </PageHeader>
            {editing === 'new' && (
                <section className='card'>
                    <MenuRow busy={busy} onCancel={() => setEditing(null)} placeholder="Nome do menu"
                        onSave={(v) => run(() => api.createMenu(v), 'Menu criado', done)} />
                </section>
            )}
            {loading ? <Skeleton h={240} /> : !(data || []).length ? <EmptyState title="Nenhum menu" /> : (data || []).map((m) => (
                <section key={m.id_layout_navbar} className='card'>
                    {editing === `m-${m.id_layout_navbar}` ? (
                        <MenuRow item={m} busy={busy} onCancel={() => setEditing(null)} onSave={(v) => saveMenu(m, v)} />
                    ) : (
                        <div className='card-head'>
                            <h2>{m.label} {!m.active && <span className='pill pill-warn'>Oculto</span>}</h2>
                            <div className='row-actions'>
                                <small className='muted'>{m.url || 'sem link'}</small>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => setEditing(`m-${m.id_layout_navbar}`)}><BsPencil /></button>
                                <DeleteButton what={`o menu "${m.label}"`} effect="Os submenus dele também são excluídos." onConfirm={() => api.deleteMenu(m)} after={reload} />
                            </div>
                        </div>
                    )}
                    <div className='elist mt-2'>
                        {(m.layout_submenu || []).map((s) => (
                            editing === `s-${s.id_layout_submenu}` ? (
                                <MenuRow key={s.id_layout_submenu} item={s} busy={busy} onCancel={() => setEditing(null)} onSave={(v) => saveSub(m, s, v)} />
                            ) : (
                                <div key={s.id_layout_submenu} className='elist-row'>
                                    <span style={{ flex: 1 }}>{s.label} {!s.active && <span className='pill pill-warn'>Oculto</span>}<br /><small className='muted'>{s.url}</small></span>
                                    <button type="button" className='btn-icon' title="Editar" onClick={() => setEditing(`s-${s.id_layout_submenu}`)}><BsPencil /></button>
                                    <DeleteButton what={`o submenu "${s.label}"`} onConfirm={() => api.deleteSubMenu(s.id_layout_submenu)} after={reload} />
                                </div>
                            )
                        ))}
                        {editing === `ns-${m.id_layout_navbar}` ? (
                            <MenuRow busy={busy} placeholder="Nome do submenu" onCancel={() => setEditing(null)}
                                onSave={(v) => run(() => api.createSubMenus(m.label, [{ ...v, id_layout_navbar: m.id_layout_navbar }]), 'Submenu criado', done)} />
                        ) : (
                            <div><button type="button" className='btn-link' onClick={() => setEditing(`ns-${m.id_layout_navbar}`)}><BsPlusLg /> Adicionar submenu</button></div>
                        )}
                    </div>
                </section>
            ))}
        </>
    );
};

export default Menu;
