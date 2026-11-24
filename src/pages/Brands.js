import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsPlusLg, BsPencil } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, SkeletonRows } from '../components/ui';
import { DeleteButton, Field, ImagePicker, Switch, Thumb, useAction } from '../components/form';

const blank = { brand: '', url_direction: '', target_blank: false, color_cell: '#ffffff', img_path: '' };

// Marcas: usadas no cadastro de produtos e na vitrine de marcas da home
const Brands = () => {
    const { data, loading, error, reload } = useLoad(() => api.brands(), []);
    const [edit, setEdit] = useState(null);
    const [file, setFile] = useState(null);
    const [run, busy] = useAction();

    const open = (b) => { setFile(null); setEdit(b ? { ...blank, ...b, target_blank: !!b.target_blank, color_cell: b.color_cell || '#ffffff' } : { ...blank }); };

    const save = async (e) => {
        e.preventDefault();
        if (!edit.brand.trim()) return;
        const body = {
            Id_brand: edit.Id_brand,
            brand: edit.brand.trim(),
            img_path: edit.img_path || '',
            url_direction: edit.url_direction || '',
            target_blank: edit.target_blank ? 1 : 0,
            color_cell: edit.color_cell || '#ffffff',
        };
        const r = await run(async () => {
            const saved = edit.Id_brand ? await api.updateBrand(body) : await api.createBrand(body);
            const id = edit.Id_brand || saved?.Id_brand || saved?.data?.Id_brand || saved?.brand?.Id_brand;
            if (file && id) await api.uploadBrandLogo(id, file);
            return saved ?? true;
        }, 'Marca salva', reload);
        if (r !== undefined) setEdit(null);
    };

    return (
        <>
            <PageHeader title="Marcas" subtitle="Aparecem nos produtos e na vitrine de marcas da página inicial.">
                <button type="button" className='btn-primary' onClick={() => open(null)}><BsPlusLg /> Nova marca</button>
            </PageHeader>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Marca</th><th>Link ao clicar</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={3} /> : (data || []).map((b) => (
                                    <tr key={b.Id_brand}>
                                        <td>
                                            <div className='cell-prod'>
                                                <span style={{ background: b.color_cell || '#fff', borderRadius: 8, padding: 2 }}><Thumb src={b.img_path} size={52} contain /></span>
                                                <strong>{b.brand}</strong>
                                            </div>
                                        </td>
                                        <td><small className='muted'>{b.url_direction || '—'}</small></td>
                                        <td>
                                            <div className='row-actions'>
                                                <button type="button" className='btn-icon' title="Editar" onClick={() => open(b)}><BsPencil /></button>
                                                <DeleteButton what={`a marca "${b.brand}"`} effect="Produtos desta marca ficam sem marca. Prefira editar se a marca ainda é usada."
                                                    onConfirm={() => api.deleteBrand(b.Id_brand)} after={reload} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !(data || []).length && <EmptyState title="Nenhuma marca" />}
                </div>
            )}

            <Modal show={!!edit} onHide={() => !busy && setEdit(null)} centered>
                {edit && (
                    <form onSubmit={save} noValidate>
                        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{edit.Id_brand ? 'Editar marca' : 'Nova marca'}</Modal.Title></Modal.Header>
                        <Modal.Body className='md-body'>
                            <Field label="Nome"><input value={edit.brand} onChange={(e) => setEdit({ ...edit, brand: e.target.value })} autoFocus /></Field>
                            <Field label="Logo">
                                <div style={{ background: edit.color_cell, borderRadius: 10, padding: 6 }}>
                                    <ImagePicker src={edit.img_path} onFile={setFile} height={110} label={edit.img_path ? 'Trocar logo' : 'Enviar logo'} />
                                </div>
                            </Field>
                            <div className='form-row'>
                                <Field label="Cor de fundo do logo"><input type="color" value={edit.color_cell} onChange={(e) => setEdit({ ...edit, color_cell: e.target.value })} style={{ height: 42 }} /></Field>
                                <Field label="Link ao clicar (opcional)"><input value={edit.url_direction || ''} onChange={(e) => setEdit({ ...edit, url_direction: e.target.value })} placeholder="/search?search=Yale" /></Field>
                            </div>
                            <Switch checked={edit.target_blank} onChange={(v) => setEdit({ ...edit, target_blank: v })} label="Abrir o link em nova aba" />
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className='btn-ghost' onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                            <button type="submit" className='btn-primary' disabled={busy || !edit.brand.trim()}>{busy ? 'Salvando…' : 'Salvar'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default Brands;
