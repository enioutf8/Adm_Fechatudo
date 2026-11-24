import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsPlusLg, BsPencil, BsLink45Deg, BsMagic } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { errMsg } from '../api/client';
import { EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, SkeletonRows } from '../components/ui';
import { DeleteButton, Field, RichText, useAction } from '../components/form';
import { money, toNumber } from '../utils/formats';

const blank = { Title: '', Price: '', Discount: '', Warranty: '', Installation_Condition: '' };

// Serviços de instalação que o cliente pode incluir ao comprar um produto.
// Cada um pode ser vinculado a um serviço do iSales - Api: o preço passa a vir de lá.
const Installations = () => {
    const { data, loading, error, reload } = useLoad(() => api.installations(), []);
    const [edit, setEdit] = useState(null);
    const [linking, setLinking] = useState(null);
    const [auto, setAuto] = useState(false);
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
            <PageHeader title="Instalações" subtitle="Serviços que o cliente pode incluir ao comprar um produto. Vinculados ao iSales - Api, o preço vem de lá.">
                <button type="button" className='btn-ghost' onClick={() => setAuto(true)}><BsMagic /> Vincular aos produtos</button>
                <button type="button" className='btn-primary' onClick={() => setEdit({ ...blank })}><BsPlusLg /> Novo serviço</button>
            </PageHeader>
            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <div className='card card-flush'>
                    <div className='tbl-wrap'>
                        <table className='tbl tbl-hover'>
                            <thead><tr><th>Serviço</th><th className='r'>Preço</th><th>iSales - Api</th><th>Garantia</th><th /></tr></thead>
                            <tbody>
                                {loading ? <SkeletonRows cols={5} /> : (data || []).map((i) => (
                                    <tr key={i.Installation_ID}>
                                        <td><strong>{i.Title}</strong></td>
                                        <td className='r nowrap'>{money(i.Price)}{Number(i.Discount) ? <small className='d-block muted'>-{Number(i.Discount)}%</small> : null}</td>
                                        <td>
                                            {i.isales_id
                                                ? <button type="button" className='pill pill-1' onClick={() => setLinking(i)} title="Trocar ou remover vínculo">#{i.isales_id}</button>
                                                : <button type="button" className='btn-link' onClick={() => setLinking(i)}><BsLink45Deg /> Vincular</button>}
                                        </td>
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
                            {edit.isales_id && <div className='alert-info'>Vinculado ao iSales - Api (#{edit.isales_id}): o preço é atualizado de lá a cada sincronização.</div>}
                            <div className='form-row'>
                                <Field label="Preço (R$)"><input inputMode="decimal" value={edit.Price} onChange={(e) => setEdit({ ...edit, Price: e.target.value })} disabled={!!edit.isales_id} /></Field>
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

            {linking && <ServiceLinker installation={linking} onClose={() => setLinking(null)} onDone={() => { setLinking(null); reload(); }} />}
            {auto && <AutoLink onClose={() => setAuto(false)} />}
        </>
    );
};

// Escolher o serviço do iSales - Api correspondente a uma instalação
const ServiceLinker = ({ installation, onClose, onDone }) => {
    const [q, setQ] = useState(() => installation.Title.replace(/instala[çc][ãa]o( de)?/i, '').trim());
    const [list, setList] = useState(null);
    const [error, setError] = useState('');
    const [run, busy] = useAction();

    useEffect(() => {
        let alive = true;
        setError('');
        api.isalesCatalog(q, false, 'service').then((r) => alive && setList(r)).catch((e) => alive && setError(errMsg(e)));
        return () => { alive = false; };
    }, [q]);

    return (
        <Modal show onHide={() => !busy && onClose()} size="lg" centered>
            <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>Vincular "{installation.Title.trim()}" ao iSales - Api</Modal.Title></Modal.Header>
            <Modal.Body className='md-body'>
                <p className='muted'>Preço atual: <strong>{money(installation.Price)}</strong>. Ao vincular, passa a ser o preço do serviço escolhido.</p>
                <div className='filters'><SearchInput value={q} onChange={setQ} placeholder="Buscar serviço no iSales - Api" autoFocus /></div>
                {error && <div className='alert-err'>{error}</div>}
                {!list ? <Skeleton h={160} /> : !list.length ? <EmptyState title="Nenhum serviço encontrado" text="Tente outra palavra (ex.: sobrepor, embutir, vidro, puxador)." /> : (
                    <table className='tbl tbl-compact tbl-hover'>
                        <tbody>
                            {list.map((s) => (
                                <tr key={s.id} className={`row-cursor ${s.id === installation.isales_id ? 'row-on' : ''}`}
                                    onClick={() => !busy && run(() => api.linkInstallationIsales(installation.Installation_ID, s.id), 'Instalação vinculada', onDone)}>
                                    <td><strong>{s.name}</strong><small className='d-block muted'>#{s.id} · código {s.ean}{s.linkedCount ? ` · já usado em ${s.linkedCount} instalação(ões)` : ''}{s.active ? '' : ' · inativo no iSales'}</small></td>
                                    <td className='r nowrap'><strong>{money(s.price)}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Modal.Body>
            <Modal.Footer>
                {installation.isales_id && (
                    <button type="button" className='btn-danger-ghost me-auto' disabled={busy}
                        onClick={() => run(() => api.unlinkInstallationIsales(installation.Installation_ID), 'Vínculo removido', onDone)}>Remover vínculo</button>
                )}
                <button type="button" className='btn-ghost' onClick={onClose} disabled={busy}>Fechar</button>
            </Modal.Footer>
        </Modal>
    );
};

// Liga as instalações aos produtos pelo tipo do produto, com prévia antes de gravar
const AutoLink = ({ onClose }) => {
    const { data, loading, error, reload } = useLoad(() => api.autoLinkPreview(), []);
    const [assign, setAssign] = useState({});
    const [open, setOpen] = useState(null);
    const [run, busy] = useAction();

    useEffect(() => {
        if (!data) return;
        setAssign(Object.fromEntries(data.rules.map((r) => [r.key, r.suggested || ''])));
    }, [data]);

    const toCreate = (data?.rules || []).reduce((sum, r) => {
        const id = Number(assign[r.key]);
        return sum + (id ? r.products.filter((p) => !p.linked.includes(id)).length : 0);
    }, 0);

    return (
        <Modal show onHide={() => !busy && onClose()} size="lg" centered>
            <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>Vincular instalações aos produtos</Modal.Title></Modal.Header>
            <Modal.Body className='md-body'>
                <p className='muted'>Cada grupo de produtos recebe a instalação escolhida (o cliente passa a poder incluí-la na compra). Só acrescenta vínculos — os que já existem continuam. Depois dá para ajustar produto a produto, na aba Instalações do produto.</p>
                {error ? <ErrorState text={error} onRetry={reload} /> : loading || !data ? <Skeleton h={260} /> : (
                    <table className='tbl tbl-compact'>
                        <thead><tr><th>Produtos</th><th>Instalação</th><th className='r'>Novos</th></tr></thead>
                        <tbody>
                            {data.rules.map((r) => {
                                const id = Number(assign[r.key]);
                                const novos = id ? r.products.filter((p) => !p.linked.includes(id)).length : 0;
                                return (
                                    <React.Fragment key={r.key}>
                                        <tr>
                                            <td>
                                                <strong>{r.label}</strong>
                                                <button type="button" className='btn-link d-block' onClick={() => setOpen(open === r.key ? null : r.key)}>
                                                    {r.products.length} produto(s) {open === r.key ? '▲' : '▼'}
                                                </button>
                                            </td>
                                            <td>
                                                <select value={assign[r.key] ?? ''} onChange={(e) => setAssign({ ...assign, [r.key]: e.target.value })} style={{ maxWidth: 320 }}>
                                                    <option value="">Não vincular</option>
                                                    {data.installations.map((i) => <option key={i.Installation_ID} value={i.Installation_ID}>{i.Title.trim()} — {money(i.Price)}</option>)}
                                                </select>
                                            </td>
                                            <td className='r'>{novos}</td>
                                        </tr>
                                        {open === r.key && (
                                            <tr className='row-detail'><td colSpan={3}><small>{r.products.map((p) => p.Product_Name).join(' · ') || 'Nenhum produto neste grupo.'}</small></td></tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {data.unmatched.length > 0 && (
                                <tr><td colSpan={3}><small className='muted'>Sem instalação ({data.unmatched.length}): {data.unmatched.map((p) => p.Product_Name).join(' · ')}</small></td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className='btn-ghost' onClick={onClose} disabled={busy}>Cancelar</button>
                <button type="button" className='btn-primary' disabled={busy || !toCreate}
                    onClick={() => run(() => api.autoLinkApply(assign), null, (r) => { alert(r.message); onClose(); })}>
                    {busy ? 'Gravando…' : `Criar ${toCreate} vínculo(s)`}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default Installations;
