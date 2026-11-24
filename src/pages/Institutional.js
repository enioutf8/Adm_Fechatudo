import React, { useState } from 'react';
import { BsPlusLg, BsPencil } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../components/ui';
import { DeleteButton, useAction } from '../components/form';

// Textos institucionais. O primeiro aparece na página inicial ("nossa história") e na página Sobre.
const Institutional = () => {
    const { data, loading, error, reload } = useLoad(() => api.institutional(), []);
    const [editing, setEditing] = useState(null);
    const [text, setText] = useState('');
    const [run, busy] = useAction();

    const start = (key, value = '') => { setEditing(key); setText(value); };
    const save = () => {
        if (!text.trim()) return;
        const fn = editing === 'new' ? () => api.createInstitutional(text.trim()) : () => api.updateInstitutional(editing, text.trim());
        run(fn, 'Texto salvo', () => { setEditing(null); return reload(); });
    };
    const editor = (
        <div className='stack'>
            <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className='w-100' style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12 }} autoFocus />
            <div className='form-row'>
                <button type="button" className='btn-primary' disabled={busy || !text.trim()} onClick={save}>{busy ? 'Salvando…' : 'Salvar'}</button>
                <button type="button" className='btn-ghost' onClick={() => setEditing(null)}>Cancelar</button>
            </div>
        </div>
    );

    if (error) return <ErrorState text={error} onRetry={reload} />;
    return (
        <>
            <PageHeader title="Institucional" subtitle="Texto sobre a empresa. O primeiro da lista aparece na página inicial e na página Sobre.">
                <button type="button" className='btn-primary' onClick={() => start('new')}><BsPlusLg /> Novo texto</button>
            </PageHeader>
            {editing === 'new' && <section className='card'>{editor}</section>}
            {loading ? <Skeleton h={160} /> : !(data || []).length ? <EmptyState title="Nenhum texto" /> : (data || []).map((t, i) => (
                <section key={t.id_texts_institutional} className='card'>
                    <div className='card-head'>
                        <h2>{i === 0 ? 'Texto principal (aparece no site)' : `Texto ${i + 1}`}</h2>
                        {editing !== t.id_texts_institutional && (
                            <div className='row-actions'>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => start(t.id_texts_institutional, t.label)}><BsPencil /></button>
                                <DeleteButton what="este texto" onConfirm={() => api.deleteInstitutional(t.id_texts_institutional)} after={reload} />
                            </div>
                        )}
                    </div>
                    {editing === t.id_texts_institutional ? editor : <p style={{ whiteSpace: 'pre-line' }} className='mb-0'>{t.label}</p>}
                </section>
            ))}
        </>
    );
};

export default Institutional;
