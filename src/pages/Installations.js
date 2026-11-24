import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsPlusLg, BsPencil } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, SkeletonRows } from '../components/ui';
import { DeleteButton, Field, RichText, useAction } from '../components/form';
import { money, toNumber } from '../utils/formats';

const blank = { Title: '', Price: '', Discount: '', Warranty: '', Installation_Condition: '' };

// Serviços de instalação que o cliente pode incluir ao comprar um produto
const Installations = () => {
    const { data, loading, error, reload } = useLoad(() => api.installations(), []);
    const [edit, setEdit] = useState(null);
    const [run, busy] = useAction();

    const save = async (e) => {
        e.preventDefault();
        if (!edit.Title.trim()) return;
        const body = { ...edit, Title: edit.Title.trim(), Price: toNumber(edit.Price), Discount: toNumber(edit.Discount) || null };
        const r = await run(() => (edit.Installation_ID ? api.updateInstallation(edit.Installation_ID, body) : api.createInstallation(body)), 'Serviço salvo', reload);
        if (r !== undefined) setEdit(null);
    };

    return (
        <>
            <PageHeader title="Instalações" subtitle="Serviços oferecidos junto com os produtos (escolha em quais produtos na tela de cada produto).">
                <button type="button" className='btn-primary' onClick={() => setEdit({ ...blank })}><BsPlusLg /> Novo serviço</button>
            </PageHeader>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Serviço</th><th className='r'>Preço</th><th className='r'>Desconto</th><th>Garantia</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={5} /> : (data || []).map((i) => (
                                    <tr key={i.Installation_ID}>
                                        <td><strong>{i.Title}</strong></td>
                                        <td className='r'>{money(i.Price)}</td>
                                        <td className='r'>{Number(i.Discount) ? `${Number(i.Discount)}%` : '—'}</td>
                                        <td>{i.Warranty || '—'}</td>
                                        <td>
                                            <div className='row-actions'>
                                                <button type="button" className='btn-icon' title="Editar" onClick={() => setEdit({ ...blank, ...i, Discount: i.Discount ?? '' })}><BsPencil /></button>
                                                <DeleteButton what={`o serviço "${i.Title}"`} effect="Ele deixa de ser oferecido em todos os produtos."
                                                    onConfirm={() => api.deleteInstallation(i.Installation_ID)} after={reload} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !(data || []).length && <EmptyState title="Nenhum serviço cadastrado" />}
                </div>
            )}

            <Modal show={!!edit} onHide={() => !busy && setEdit(null)} size="lg" centered>
                {edit && (
                    <form onSubmit={save} noValidate>
                        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{edit.Installation_ID ? 'Editar serviço' : 'Novo serviço'}</Modal.Title></Modal.Header>
                        <Modal.Body className='md-body'>
                            <Field label="Nome do serviço"><input value={edit.Title} onChange={(e) => setEdit({ ...edit, Title: e.target.value })} autoFocus /></Field>
                            <div className='form-row'>
                                <Field label="Preço (R$)"><input inputMode="decimal" value={edit.Price} onChange={(e) => setEdit({ ...edit, Price: e.target.value })} /></Field>
                                <Field label="Desconto (%)"><input inputMode="decimal" value={edit.Discount} onChange={(e) => setEdit({ ...edit, Discount: e.target.value })} /></Field>
                                <Field label="Garantia"><input value={edit.Warranty || ''} onChange={(e) => setEdit({ ...edit, Warranty: e.target.value })} placeholder="Ex.: 90 dias" /></Field>
                            </div>
                            <Field label="Condições e detalhes (aparece ao clicar no serviço)">
                                <RichText value={edit.Installation_Condition} onChange={(v) => setEdit((x) => ({ ...x, Installation_Condition: v }))} height={200} />
                            </Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className='btn-ghost' onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                            <button type="submit" className='btn-primary' disabled={busy || !edit.Title.trim()}>{busy ? 'Salvando…' : 'Salvar'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default Installations;
