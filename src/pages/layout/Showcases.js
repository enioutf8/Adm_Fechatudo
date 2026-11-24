import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsPlusLg, BsPencil } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from '../../components/ui';
import { DeleteButton, Field, ImagePicker, Switch, Thumb, useAction } from '../../components/form';
import { useSearchParams } from 'react-router-dom';

const pickId = (r, key) => r?.[key] || r?.data?.[key];

// Vitrines da página inicial: ícones das subcategorias e "compre por ambiente"
const Showcases = () => {
    const [params, setParams] = useSearchParams();
    const tab = params.get('aba') === 'ambientes' ? 'ambientes' : 'icones';
    return (
        <>
            <PageHeader title="Vitrines da página inicial" subtitle="Atalhos com imagem que aparecem na home do site." />
            <Tabs value={tab} onChange={(k) => setParams({ aba: k }, { replace: true })}
                items={[{ key: 'icones', label: 'Ícones de categorias' }, { key: 'ambientes', label: 'Compre por ambiente' }]} />
            {tab === 'icones' ? <Icons /> : <Environments />}
        </>
    );
};

const Icons = () => {
    const { data, loading, error, reload } = useLoad(() => api.subcategoryIcons(), []);
    const { data: categories } = useLoad(() => api.categories(), []);
    const [edit, setEdit] = useState(null);
    const [file, setFile] = useState(null);
    const [run, busy] = useAction();

    const open = (x) => { setFile(null); setEdit(x ? { ...x, target_blank: !!x.target_blank } : { id_sub_category: '', url_direction: '', target_blank: false }); };
    const save = async (e) => {
        e.preventDefault();
        if (!edit.id_sub_category) return;
        if (!edit.id_layout_subcategories && !file) { alert('Escolha o ícone.'); return; }
        const body = { id_layout_subcategories: edit.id_layout_subcategories, id_sub_category: Number(edit.id_sub_category), url_icon: edit.url_icon || '', url_direction: edit.url_direction || '', target_blank: edit.target_blank ? 1 : 0 };
        const r = await run(async () => {
            const saved = edit.id_layout_subcategories ? await api.updateSubcategoryIcon(body) : await api.createSubcategoryIcon(body);
            const id = edit.id_layout_subcategories || pickId(saved, 'id_layout_subcategories');
            if (file && id) await api.uploadSubcategoryIcon(id, file);
            return true;
        }, 'Ícone salvo', reload);
        if (r) setEdit(null);
    };

    if (error) return <ErrorState text={error} onRetry={reload} />;
    return (
        <>
            <div className='filters'><button type="button" className='btn-primary' onClick={() => open(null)}><BsPlusLg /> Novo ícone</button></div>
            {loading ? <Skeleton h={200} /> : !(data || []).length ? <EmptyState title="Nenhum ícone" /> : (
                <div className='isl'>
                    {(data || []).map((x) => (
                        <div key={x.id_layout_subcategories} className='isl-card'>
                            <Thumb src={x.url_icon} size={120} contain />
                            <strong>{x.sub_category?.label || `Subcategoria ${x.id_sub_category}`}</strong>
                            <small>{x.url_direction || 'Abre a busca da subcategoria'}</small>
                            <div className='row-actions'>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => open(x)}><BsPencil /></button>
                                <DeleteButton what="este ícone" onConfirm={() => api.deleteSubcategoryIcon(x.id_layout_subcategories)} after={reload} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal show={!!edit} onHide={() => !busy && setEdit(null)} centered>
                {edit && (
                    <form onSubmit={save} noValidate>
                        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{edit.id_layout_subcategories ? 'Editar ícone' : 'Novo ícone'}</Modal.Title></Modal.Header>
                        <Modal.Body className='md-body'>
                            <Field label="Subcategoria">
                                <select value={edit.id_sub_category} onChange={(e) => setEdit({ ...edit, id_sub_category: e.target.value })}>
                                    <option value="">Escolha…</option>
                                    {(categories || []).map((c) => (
                                        <optgroup key={c.id_category} label={c.label}>
                                            {(c.sub_category || []).map((s) => <option key={s.id_sub_category} value={s.id_sub_category}>{s.label}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Ícone"><ImagePicker src={edit.url_icon} onFile={setFile} height={120} /></Field>
                            <Field label="Link ao clicar (opcional)" hint="Vazio: abre a busca da subcategoria"><input value={edit.url_direction || ''} onChange={(e) => setEdit({ ...edit, url_direction: e.target.value })} /></Field>
                            <Switch checked={edit.target_blank} onChange={(v) => setEdit({ ...edit, target_blank: v })} label="Abrir em nova aba" />
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className='btn-ghost' onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                            <button type="submit" className='btn-primary' disabled={busy || !edit.id_sub_category}>{busy ? 'Salvando…' : 'Salvar'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </>
    );
};

const Environments = () => {
    const { data, loading, error, reload } = useLoad(() => api.layoutEnvironments(), []);
    const [edit, setEdit] = useState(null);
    const [file, setFile] = useState(null);
    const [run, busy] = useAction();

    const open = (x) => { setFile(null); setEdit(x ? { ...x, target_blank: !!x.target_blank } : { label: '', url_direction: '', target_blank: false }); };
    const save = async (e) => {
        e.preventDefault();
        if (!edit.label.trim()) return;
        if (!edit.id_layout_environment && !file) { alert('Escolha a imagem.'); return; }
        const body = { id_layout_environment: edit.id_layout_environment, label: edit.label.trim(), url_img: edit.url_img || null, url_direction: edit.url_direction || '', target_blank: !!edit.target_blank };
        const r = await run(async () => {
            const saved = edit.id_layout_environment ? await api.updateLayoutEnvironment(body) : await api.createLayoutEnvironment(body);
            const id = edit.id_layout_environment || pickId(saved, 'id_layout_environment');
            if (file && id) await api.uploadLayoutEnvironment(id, file);
            return true;
        }, 'Ambiente salvo', reload);
        if (r) setEdit(null);
    };

    if (error) return <ErrorState text={error} onRetry={reload} />;
    return (
        <>
            <div className='filters'><button type="button" className='btn-primary' onClick={() => open(null)}><BsPlusLg /> Novo ambiente</button></div>
            {loading ? <Skeleton h={200} /> : !(data || []).length ? <EmptyState title="Nenhum ambiente" /> : (
                <div className='isl'>
                    {(data || []).map((x) => (
                        <div key={x.id_layout_environment} className='isl-card'>
                            <Thumb src={x.url_img} size={160} />
                            <strong>{x.label}</strong>
                            <small>{x.url_direction || '—'}</small>
                            <div className='row-actions'>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => open(x)}><BsPencil /></button>
                                <DeleteButton what={`o ambiente "${x.label}"`} onConfirm={() => api.deleteLayoutEnvironment(x.id_layout_environment)} after={reload} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal show={!!edit} onHide={() => !busy && setEdit(null)} centered>
                {edit && (
                    <form onSubmit={save} noValidate>
                        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{edit.id_layout_environment ? 'Editar ambiente' : 'Novo ambiente'}</Modal.Title></Modal.Header>
                        <Modal.Body className='md-body'>
                            <Field label="Título"><input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} autoFocus /></Field>
                            <Field label="Imagem"><ImagePicker src={edit.url_img} onFile={setFile} height={150} /></Field>
                            <Field label="Link ao clicar"><input value={edit.url_direction || ''} onChange={(e) => setEdit({ ...edit, url_direction: e.target.value })} placeholder="/search?search=Externo" /></Field>
                            <Switch checked={edit.target_blank} onChange={(v) => setEdit({ ...edit, target_blank: v })} label="Abrir em nova aba" />
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className='btn-ghost' onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                            <button type="submit" className='btn-primary' disabled={busy || !edit.label.trim()}>{busy ? 'Salvando…' : 'Salvar'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default Showcases;
