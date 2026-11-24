import React, { useEffect, useMemo, useState } from 'react';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { Field, RichText, Switch, useAction } from '../../components/form';
import { money, toNumber } from '../../utils/formats';

const ENVIRONMENTS = [{ v: 1, l: 'Interno' }, { v: 2, l: 'Externo' }, { v: 3, l: 'Interno e externo' }];

const blank = { Product_Name: '', Id_brand: '', id_sub_category: '', Id_Environment: 1, Price: '', Old_price: '', Unit_Discount: '', stock: '', Is_Active: true, Description: '' };

// Dados principais do produto. Preço e estoque ficam travados quando o produto tem vínculo com o iSales
// (a sincronização sobrescreveria qualquer alteração feita aqui).
const DataTab = ({ product, onSaved }) => {
    const { data: brands } = useLoad(() => api.brands(), []);
    const { data: categories } = useLoad(() => api.categories(), []);
    const [f, setF] = useState(blank);
    const [run, busy] = useAction();
    const [erro, setErro] = useState('');
    const linked = !!product?.isales_id;
    const isService = useMemo(() => {
        const cat = (categories || []).find((c) => (c.sub_category || []).some((s) => Number(s.id_sub_category) === Number(f.id_sub_category)));
        return cat && (cat.id_category === 3 || cat.label === 'Serviços');
    }, [categories, f.id_sub_category]);

    useEffect(() => {
        if (!product) { setF(blank); return; }
        setF({
            Product_Name: product.Product_Name || '',
            Id_brand: product.Id_brand || '',
            id_sub_category: product.id_sub_category || '',
            Id_Environment: product.Id_Environment || 1,
            Price: product.Price ?? '',
            Old_price: Number(product.Old_price) ? product.Old_price : '',
            Unit_Discount: Number(product.Unit_Discount) ? product.Unit_Discount : '',
            stock: product.stock ?? 0,
            Is_Active: !!product.Is_Active,
            Description: product.Description || '',
        });
    }, [product]);

    const ch = (k) => (e) => setF({ ...f, [k]: e.target.value });

    const save = async (e) => {
        e.preventDefault();
        setErro('');
        if (!f.Product_Name.trim()) return setErro('Informe o nome do produto.');
        if (!f.Id_brand) return setErro('Escolha a marca.');
        if (!f.id_sub_category) return setErro('Escolha a categoria.');
        const body = {
            Product_ID: product?.Product_ID,
            Product_Name: f.Product_Name.trim(),
            Product_Code: product?.Product_Code || '',
            Id_brand: Number(f.Id_brand),
            id_sub_category: Number(f.id_sub_category),
            Id_Environment: Number(f.Id_Environment) || 1,
            Description: f.Description,
            Price: toNumber(f.Price),
            Old_price: toNumber(f.Old_price),
            Unit_Discount: toNumber(f.Unit_Discount),
            Is_Active: f.Is_Active,
            stock: Math.max(0, Math.trunc(toNumber(f.stock))),
        };
        const saved = await run(() => api.createProduct(body), product ? 'Produto salvo' : 'Produto criado');
        if (saved) onSaved(saved);
    };

    return (
        <form className='card' onSubmit={save} noValidate>
            {erro && <div className='alert-err'>{erro}</div>}
            <Field label="Nome do produto">
                <input value={f.Product_Name} onChange={ch('Product_Name')} maxLength={255} placeholder="Ex.: Fechadura Digital de Sobrepor FR 102 Intelbras" />
            </Field>
            <div className='form-row'>
                <Field label="Marca">
                    <select value={f.Id_brand} onChange={ch('Id_brand')}>
                        <option value="">Escolha…</option>
                        {(brands || []).map((b) => <option key={b.Id_brand} value={b.Id_brand}>{b.brand}</option>)}
                    </select>
                </Field>
                <Field label="Categoria">
                    <select value={f.id_sub_category} onChange={ch('id_sub_category')}>
                        <option value="">Escolha…</option>
                        {(categories || []).map((c) => (
                            <optgroup key={c.id_category} label={c.label}>
                                {(c.sub_category || []).map((s) => <option key={s.id_sub_category} value={s.id_sub_category}>{s.label}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </Field>
                <Field label="Uso">
                    <select value={f.Id_Environment} onChange={ch('Id_Environment')}>
                        {ENVIRONMENTS.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
                    </select>
                </Field>
            </div>

            {linked && (
                <div className='alert-info'>
                    Preço e estoque vêm do iSales (produto #{product.isales_id}) e são atualizados automaticamente.
                    Para mudar, altere no iSales ou na aba <strong>Preço e estoque</strong>.
                </div>
            )}
            {!linked && !isService && product && (
                <div className='alert-warn'>Sem vínculo com o iSales: o site mostra "Avise-me quando chegar" no lugar do preço. Vincule na aba <strong>Preço e estoque</strong>.</div>
            )}
            <div className='form-row'>
                <Field label="Preço (R$)" hint={linked ? `Atual: ${money(product.Price)}` : undefined}>
                    <input inputMode="decimal" value={f.Price} onChange={ch('Price')} disabled={linked} placeholder="0,00" />
                </Field>
                <Field label="Preço antigo (R$)" hint="Aparece riscado, opcional">
                    <input inputMode="decimal" value={f.Old_price} onChange={ch('Old_price')} placeholder="0,00" />
                </Field>
                <Field label="Desconto (%)" hint="Opcional">
                    <input inputMode="decimal" value={f.Unit_Discount} onChange={ch('Unit_Discount')} placeholder="0" />
                </Field>
                <Field label="Estoque">
                    <input inputMode="numeric" value={f.stock} onChange={ch('stock')} disabled={linked} />
                </Field>
            </div>

            <Field label="Descrição (aparece em “Detalhes do produto”)">
                <RichText value={f.Description} onChange={(v) => setF((x) => ({ ...x, Description: v }))} height={300} />
            </Field>

            <div className='form-row'>
                <Switch checked={f.Is_Active} onChange={(v) => setF({ ...f, Is_Active: v })} label={f.Is_Active ? 'Ativo: aparece no site' : 'Inativo: não aparece no site'} />
            </div>
            <div className='mt-3'>
                <button type="submit" className='btn-primary' disabled={busy}>{busy ? 'Salvando…' : product ? 'Salvar alterações' : 'Criar produto'}</button>
            </div>
        </form>
    );
};

export default DataTab;
