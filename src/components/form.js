import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsImage, BsTrash, BsUpload } from 'react-icons/bs';
import { assetUrl, errMsg } from '../api/client';
import { useToast } from './Toasts';
import { ConfirmDialog } from './ui';

// Campo com rótulo no padrão do admin: <Field label="Nome"><input .../></Field>
export const Field = ({ label, hint, children, className = '' }) => (
    <label className={`fl ${className}`}>
        <span>{label}</span>
        {children}
        {hint && <small className='muted'>{hint}</small>}
    </label>
);

// Liga/desliga
export const Switch = ({ checked, onChange, label, disabled }) => (
    <label className='switch'>
        <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
    </label>
);

// Miniatura de imagem do site (/uploads/...) com marcador quando não há imagem
export const Thumb = ({ src, alt = '', size = 56, contain }) => (
    src
        ? <img src={assetUrl(src)} alt={alt} className='thumb' style={{ width: size, height: size, objectFit: contain ? 'contain' : 'cover' }} loading="lazy" />
        : <span className='thumb thumb-empty' style={{ width: size, height: size }}><BsImage aria-hidden="true" /></span>
);

/**
 * Escolher imagem com prévia. Mostra a imagem atual (src) ou a escolhida.
 * onFile(file) recebe o arquivo; o envio fica com a tela (para poder enviar junto com o resto).
 */
export const ImagePicker = ({ src, onFile, accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml', label = 'Escolher imagem', height = 120, busy }) => {
    const [preview, setPreview] = useState(null);
    const input = useRef(null);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
    const pick = (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert('A imagem passa de 5 MB. Reduza o tamanho e tente de novo.'); return; }
        setPreview(URL.createObjectURL(file));
        onFile(file);
        if (input.current) input.current.value = '';
    };
    const shown = preview || (src ? assetUrl(src) : '');
    return (
        <div className='ip'>
            <div className='ip-prev' style={{ height }}>
                {shown ? <img src={shown} alt="" /> : <span className='muted'><BsImage /> Sem imagem</span>}
            </div>
            <button type="button" className='btn-ghost btn-sm' disabled={busy} onClick={() => input.current?.click()}>
                <BsUpload /> {busy ? 'Enviando…' : label}
            </button>
            <input ref={input} type="file" accept={accept} hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
    );
};

/**
 * Ação com aviso de sucesso/erro e recarga da lista.
 * const run = useAction(); run(() => api.salvar(x), 'Salvo', reload)
 */
export const useAction = () => {
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    const run = useCallback(async (fn, okMsg, after) => {
        setBusy(true);
        try {
            const r = await fn();
            if (okMsg) toast.ok(okMsg);
            if (after) await after(r);
            return r;
        } catch (err) {
            toast.erro(errMsg(err));
            return undefined;
        } finally { setBusy(false); }
    }, [toast]);
    return [run, busy];
};

/**
 * Botão de excluir com confirmação.
 * <DeleteButton what="a marca Yale" onConfirm={() => api.deleteBrand(id)} after={reload} />
 */
export const DeleteButton = ({ what, onConfirm, after, label, effect }) => {
    const [open, setOpen] = useState(false);
    const [run, busy] = useAction();
    return (
        <>
            <button type="button" className={label ? 'btn-danger-ghost btn-sm' : 'btn-icon btn-icon-danger'} onClick={() => setOpen(true)}
                aria-label={`Excluir ${what}`} title="Excluir">
                <BsTrash />{label ? ` ${label}` : ''}
            </button>
            <ConfirmDialog show={open} title="Confirmar exclusão" tone="danger" confirmLabel="Excluir" busy={busy}
                onCancel={() => setOpen(false)}
                onConfirm={async () => { const r = await run(onConfirm, 'Excluído', after); if (r !== undefined) setOpen(false); }}>
                <p>Excluir {what}?</p>
                <p className='muted'>{effect || 'Essa ação não pode ser desfeita.'}</p>
            </ConfirmDialog>
        </>
    );
};

// Editor de texto rico (carregado só quando usado)
const QuillLazy = React.lazy(() => import('./RichTextEditor'));
export const RichText = (props) => (
    <React.Suspense fallback={<div className='sk' style={{ height: props.height || 220 }} />}>
        <QuillLazy {...props} />
    </React.Suspense>
);
