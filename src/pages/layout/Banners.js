import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsPlusLg, BsPencil, BsPhone, BsDisplay } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { assetUrl } from '../../api/client';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui';
import { DeleteButton, Field, ImagePicker, useAction } from '../../components/form';

const clean = (v) => (v && v !== 'null' && v !== 'undefined' ? v : '');

// Banners do carrossel da página inicial (cada um com versão para computador e para celular) + logo do site
const Banners = () => {
    const { data, loading, error, reload } = useLoad(() => api.banners(), []);
    const logo = useLoad(() => api.logo(), []);
    const [edit, setEdit] = useState(null); // { banner?, desktopFile, mobileFile, url, alt }
    const [logoFile, setLogoFile] = useState(null);
    const [run, busy] = useAction();

    const open = (b) => setEdit({ banner: b, desktopFile: null, mobileFile: null, url: clean(b?.url), alt: clean(b?.alt) });

    const save = async (e) => {
        e.preventDefault();
        const { banner, desktopFile, mobileFile, url, alt } = edit;
        if (!banner && !desktopFile) { alert('Escolha a imagem para computador.'); return; }
        const r = await run(async () => {
            let archive = banner;
            if (!banner) {
                const created = await api.uploadBanner(desktopFile, url, alt);
                // A rota responde { path: { archive: {...} } }
                archive = created?.path?.archive || created?.archive || created;
            } else {
                await api.updateBanner({ id_archives: banner.id_archives, url, alt });
            }
            const archiveId = archive?.id_archives;
            const mobile = banner?.archives_mobile;
            if (mobileFile && archiveId) {
                if (mobile?.id_mobile) await api.deleteBannerMobile(mobile.id_mobile);
                await api.uploadBannerMobile(archiveId, mobileFile, url, alt);
            } else if (mobile?.id_mobile) {
                await api.updateBannerMobile({ id_mobile: mobile.id_mobile, url, alt });
            }
            return true;
        }, 'Banner salvo', reload);
        if (r) setEdit(null);
    };

    return (
        <>
            <PageHeader title="Banners e logo" subtitle="Carrossel da página inicial e logo do cabeçalho do site.">
                <button type="button" className='btn-primary' onClick={() => open(null)}><BsPlusLg /> Novo banner</button>
            </PageHeader>

            {error ? <ErrorState text={error} onRetry={reload} /> : loading ? <Skeleton h={220} /> : !(data || []).length ? (
                <EmptyState title="Nenhum banner" text="A página inicial fica sem carrossel." />
            ) : (
                <div className='stack'>
                    {(data || []).map((b, i) => (
                        <section key={b.id_archives} className='card'>
                            <div className='card-head'>
                                <h2>Banner {i + 1}</h2>
                                <div className='row-actions'>
                                    <button type="button" className='btn-icon' title="Editar" onClick={() => open(b)}><BsPencil /></button>
                                    <DeleteButton what="este banner" effect="Sai do carrossel da página inicial (versões de computador e celular)."
                                        onConfirm={async () => { if (b.archives_mobile?.id_mobile) await api.deleteBannerMobile(b.archives_mobile.id_mobile); return api.deleteBanner(b.id_archives); }}
                                        after={reload} />
                                </div>
                            </div>
                            <div className='grid-2' style={{ gridTemplateColumns: '3fr 1fr' }}>
                                <div><small className='muted'><BsDisplay /> Computador</small><img src={assetUrl(b.archive)} alt="" className='w-100' style={{ borderRadius: 10, border: '1px solid var(--line)' }} /></div>
                                <div>
                                    <small className='muted'><BsPhone /> Celular</small>
                                    {b.archives_mobile?.archive_mobile
                                        ? <img src={assetUrl(b.archives_mobile.archive_mobile)} alt="" className='w-100' style={{ borderRadius: 10, border: '1px solid var(--line)' }} />
                                        : <p className='text-warn small'>Sem versão para celular (usa a de computador).</p>}
                                </div>
                            </div>
                            <p className='muted small mb-0 mt-2'>Link: {clean(b.url) || '—'} · Texto alternativo: {clean(b.alt) || '—'}</p>
                        </section>
                    ))}
                </div>
            )}

            <section className='card mt-3'>
                <h2>Logo do site</h2>
                <p className='muted'>Aparece no cabeçalho. Use PNG ou SVG com fundo transparente.</p>
                <div style={{ maxWidth: 360 }}>
                    <ImagePicker src={logo.data?.archive} onFile={setLogoFile} height={110} label="Escolher novo logo" />
                </div>
                <button type="button" className='btn-primary' disabled={!logoFile || busy}
                    onClick={() => run(() => api.uploadLogo(logoFile), 'Logo atualizado', () => { setLogoFile(null); return logo.reload(); })}>
                    Salvar logo
                </button>
            </section>

            <Modal show={!!edit} onHide={() => !busy && setEdit(null)} size="lg" centered>
                {edit && (
                    <form onSubmit={save} noValidate>
                        <Modal.Header closeButton={!busy}><Modal.Title as="h2" className='md-title'>{edit.banner ? 'Editar banner' : 'Novo banner'}</Modal.Title></Modal.Header>
                        <Modal.Body className='md-body'>
                            <div className='grid-2' style={{ gridTemplateColumns: '3fr 2fr' }}>
                                <Field label="Imagem para computador" hint={edit.banner ? 'Para trocar, exclua e crie outro banner.' : 'Recomendado: 1920 × 600 px'}>
                                    {edit.banner ? <img src={assetUrl(edit.banner.archive)} alt="" className='w-100' style={{ borderRadius: 10 }} />
                                        : <ImagePicker onFile={(f) => setEdit((x) => ({ ...x, desktopFile: f }))} height={150} />}
                                </Field>
                                <Field label="Imagem para celular" hint="Recomendado: 800 × 1000 px">
                                    <ImagePicker src={edit.banner?.archives_mobile?.archive_mobile} onFile={(f) => setEdit((x) => ({ ...x, mobileFile: f }))} height={150}
                                        label={edit.banner?.archives_mobile ? 'Trocar' : 'Escolher'} />
                                </Field>
                            </div>
                            <Field label="Link ao clicar (opcional)"><input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} placeholder="/search?search=Digital" /></Field>
                            <Field label="Texto alternativo" hint="Descreve a imagem para o Google e leitores de tela"><input value={edit.alt} onChange={(e) => setEdit({ ...edit, alt: e.target.value })} /></Field>
                        </Modal.Body>
                        <Modal.Footer>
                            <button type="button" className='btn-ghost' onClick={() => setEdit(null)} disabled={busy}>Cancelar</button>
                            <button type="submit" className='btn-primary' disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button>
                        </Modal.Footer>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default Banners;
