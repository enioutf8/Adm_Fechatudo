import React, { useRef, useState } from 'react';
import { BsStar, BsUpload, BsYoutube, BsPlusLg } from 'react-icons/bs';
import api from '../../api/admin';
import { assetUrl } from '../../api/client';
import { EmptyState } from '../../components/ui';
import { DeleteButton, Field, useAction } from '../../components/form';

// Fotos (a primeira é a capa), vídeos do YouTube e banners da página do produto
const MediaTab = ({ product, reload }) => {
    const [run, busy] = useAction();
    const [video, setVideo] = useState('');
    const bannerInput = useRef(null);
    const photos = product.photos || [];

    const uploadPhotos = (files) => {
        const list = [...files].filter((f) => f.type.startsWith('image/'));
        if (!list.length) return;
        if (list.some((f) => f.size > 5 * 1024 * 1024)) { alert('Cada foto pode ter no máximo 5 MB.'); return; }
        // O servidor aceita até 6 por envio
        const chunks = [];
        for (let i = 0; i < list.length; i += 6) chunks.push(list.slice(i, i + 6));
        run(async () => { for (const c of chunks) await api.uploadPhotos(product, c); }, `${list.length} foto(s) enviada(s)`, reload);
    };

    const addVideo = (e) => {
        e.preventDefault();
        const url = video.trim();
        if (!/youtu\.?be/i.test(url)) { alert('Cole o link de um vídeo do YouTube.'); return; }
        run(() => api.addProductVideo(product.Product_ID, url), 'Vídeo adicionado', () => { setVideo(''); return reload(); });
    };

    return (
        <>
            <section className='card'>
                <div className='card-head'>
                    <h2>Fotos</h2>
                    <small className='muted'>A primeira é a capa no site. Até 5 MB cada.</small>
                </div>
                <PhotoDrop busy={busy} onFiles={uploadPhotos} />
                {photos.length ? (
                    <div className='gal mt-3'>
                        {photos.map((ph, i) => (
                            <div key={ph.Id_Product_Imgs} className='gal-item'>
                                <img src={assetUrl(ph.url)} alt="" loading="lazy" />
                                {i === 0 ? <span className='gal-tag'>Capa</span> : (
                                    <button type="button" className='btn-icon' style={{ right: 44 }} title="Usar como capa" disabled={busy}
                                        onClick={() => run(() => api.setCoverPhoto(product.Product_ID, ph.Id_Product_Imgs), 'Capa atualizada', reload)}>
                                        <BsStar />
                                    </button>
                                )}
                                <DeleteButton what="esta foto" onConfirm={() => api.deletePhoto(ph.Id_Product_Imgs)} after={reload} />
                            </div>
                        ))}
                    </div>
                ) : <EmptyState title="Sem fotos" text="Produtos sem foto aparecem com uma imagem padrão no site." />}
            </section>

            <section className='card'>
                <h2>Vídeos do YouTube</h2>
                <form className='form-row' onSubmit={addVideo}>
                    <Field label="Link do vídeo"><input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" /></Field>
                    <button type="submit" className='btn-ghost' disabled={busy || !video.trim()}><BsPlusLg /> Adicionar</button>
                </form>
                {(product.videos || []).length ? (
                    <table className='tbl tbl-compact'>
                        <tbody>
                            {product.videos.map((v) => (
                                <tr key={v.Id_Product_Imgs}>
                                    <td><BsYoutube className='text-danger' /> <a href={v.url} target="_blank" rel="noreferrer">{v.url}</a></td>
                                    <td className='r'><DeleteButton what="este vídeo" onConfirm={() => api.deleteProductVideo(v.Id_Product_Imgs)} after={reload} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className='muted'>Nenhum vídeo do YouTube.</p>}
                <p className='muted small'>Vídeos gravados pela loja (arquivos MP4 da galeria) continuam sendo adicionados pela pasta do servidor.</p>
            </section>

            <section className='card'>
                <div className='card-head'>
                    <h2>Banners da página do produto</h2>
                    <button type="button" className='btn-ghost btn-sm' disabled={busy} onClick={() => bannerInput.current?.click()}><BsUpload /> Enviar banner</button>
                </div>
                <input ref={bannerInput} type="file" accept="image/*" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) run(() => api.uploadProductBanner(product.Product_ID, file), 'Banner enviado', reload);
                }} />
                {(product.banners || []).length ? (
                    <div className='stack'>
                        {product.banners.map((b) => (
                            <div key={b.Id_Product_Banner} className='gal-item' style={{ aspectRatio: 'auto', height: 140 }}>
                                <img src={assetUrl(b.url)} alt="" />
                                <DeleteButton what="este banner" onConfirm={() => api.deleteProductBanner(b.Id_Product_Banner)} after={reload} />
                            </div>
                        ))}
                    </div>
                ) : <p className='muted'>Nenhum banner. Banners aparecem abaixo dos detalhes do produto.</p>}
            </section>
        </>
    );
};

// Área de soltar várias fotos de uma vez (mesmo visual do FileDrop)
const PhotoDrop = ({ onFiles, busy }) => {
    const input = useRef(null);
    const [over, setOver] = useState(false);
    return (
        <div
            className={`fd ${over ? 'fd-over' : ''} ${busy ? 'fd-busy' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); if (!busy) onFiles(e.dataTransfer.files || []); }}
            onClick={() => !busy && input.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        >
            <BsUpload aria-hidden="true" />
            <span>{busy ? 'Enviando…' : 'Arraste as fotos aqui ou clique para escolher (pode selecionar várias)'}</span>
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files || []); e.target.value = ''; }} />
        </div>
    );
};

export default MediaTab;
