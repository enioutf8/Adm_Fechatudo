import React, { useState } from 'react';
import { BsPlusLg, BsCheck2, BsPencil } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui';
import { DeleteButton, useAction } from '../../components/form';

// Textos do rodapé (horários de atendimento etc.). Os links do rodapé vêm do Menu.
const Footer = () => {
    const { data, loading, error, reload } = useLoad(() => api.footer(), []);
    const [editing, setEditing] = useState(null);
    const [text, setText] = useState('');
    const [run, busy] = useAction();

    const start = (key, value = '') => { setEditing(key); setText(value); };
    const save = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const fn = editing === 'new' ? () => api.createFooter(text.trim()) : () => api.updateFooter(editing, text.trim());
        run(fn, 'Rodapé salvo', () => { setEditing(null); return reload(); });
    };
    const form = (
        <form className='elist-row' onSubmit={save}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: 08:00 às 17:30 - Segunda a Sexta" autoFocus />
            <button type="submit" className='btn-primary btn-sm' disabled={busy || !text.trim()}><BsCheck2 /> Salvar</button>
            <button type="button" className='btn-ghost btn-sm' onClick={() => setEditing(null)}>Cancelar</button>
        </form>
    );

    if (error) return <ErrorState text={error} onRetry={reload} />;
    return (
        <>
            <PageHeader title="Rodapé" subtitle="Textos de horário de atendimento exibidos no rodapé do site. Os links do rodapé vêm do Menu.">
                <button type="button" className='btn-primary' onClick={() => start('new')}><BsPlusLg /> Novo texto</button>
            </PageHeader>
            <section className='card'>
                {loading ? <Skeleton h={100} /> : (
                    <div className='elist'>
                        {editing === 'new' && form}
                        {(data || []).map((f) => (editing === f.id_layout_Footer ? <React.Fragment key={f.id_layout_Footer}>{form}</React.Fragment> : (
                            <div key={f.id_layout_Footer} className='elist-row'>
                                <span style={{ flex: 1 }}>{f.label}</span>
                                <button type="button" className='btn-icon' title="Editar" onClick={() => start(f.id_layout_Footer, f.label)}><BsPencil /></button>
                                <DeleteButton what={`"${f.label}"`} onConfirm={() => api.deleteFooter(f.id_layout_Footer)} after={reload} />
                            </div>
                        )))}
                        {!(data || []).length && editing !== 'new' && <EmptyState title="Nenhum texto no rodapé" />}
                    </div>
                )}
            </section>
        </>
    );
};

export default Footer;
