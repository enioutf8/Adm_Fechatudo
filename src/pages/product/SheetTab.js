import React, { useEffect, useState } from 'react';
import api from '../../api/admin';
import { Field, useAction } from '../../components/form';

// Campos que o site mostra em "Especificações" (abaixo da marca) e em "Informações adicionais".
// Os que vêm do iSales são regravados a cada sincronização quando o produto tem vínculo.
const FIELDS = [
    { k: 'Color', l: 'Cor', isales: true },
    { k: 'Size', l: 'Tamanho', isales: true },
    { k: 'Height', l: 'Altura (cm)', num: true },
    { k: 'Width', l: 'Largura (cm)', num: true },
    { k: 'Depth', l: 'Profundidade (cm)', num: true },
    { k: 'Weight', l: 'Peso (kg)', num: true },
    { k: 'Warranty_Days', l: 'Garantia (dias)', num: true, isales: true, hint: '365 = 1 ano' },
    { k: 'Barcode', l: 'Código de barras (EAN)', isales: true },
];

const SheetTab = ({ product, reload }) => {
    const [run, busy] = useAction();
    const [f, setF] = useState({});
    const sheet = product.technical_sheet || {};
    const linked = !!product.isales_id;

    useEffect(() => {
        const s = product.technical_sheet || {};
        const v = {};
        [...FIELDS.map((x) => x.k), 'Additional_Info'].forEach((k) => { v[k] = s[k] ?? ''; });
        setF(v);
    }, [product]);

    const changed = Object.keys(f).filter((k) => String(f[k] ?? '') !== String(sheet[k] ?? ''));

    const save = (e) => {
        e.preventDefault();
        const body = {};
        changed.forEach((k) => { body[k] = f[k]; });
        run(() => api.saveSheet(product.Product_ID, body), 'Especificações salvas', reload);
    };

    return (
        <form className='card' onSubmit={save} noValidate>
            <h2>Especificações</h2>
            <p className='muted'>Aparecem logo abaixo da marca, na página do produto. Campos vazios não são exibidos.</p>
            {linked && (
                <div className='alert-info'>
                    Este produto tem vínculo com o iSales - Api: <strong>cor, tamanho, garantia, EAN e informações adicionais</strong> são atualizados
                    pelo iSales - Api a cada sincronização. Altere esses dados no iSales - Api para que não voltem ao valor de lá.
                </div>
            )}
            <div className='form-row'>
                {FIELDS.map((x) => (
                    <Field key={x.k} label={`${x.l}${linked && x.isales ? ' · iSales - Api' : ''}`} hint={x.hint}>
                        <input value={f[x.k] ?? ''} inputMode={x.num ? 'decimal' : undefined} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} />
                    </Field>
                ))}
            </div>
            <Field label={`Informações adicionais${linked ? ' · iSales - Api' : ''}`} hint="Texto simples, exibido num cartão abaixo dos detalhes do produto">
                <textarea rows={6} value={f.Additional_Info ?? ''} onChange={(e) => setF({ ...f, Additional_Info: e.target.value })} />
            </Field>
            <button type="submit" className='btn-primary' disabled={busy || !changed.length}>{busy ? 'Salvando…' : 'Salvar especificações'}</button>
        </form>
    );
};

export default SheetTab;
