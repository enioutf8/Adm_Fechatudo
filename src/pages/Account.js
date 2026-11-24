import React, { useState } from 'react';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { PageHeader, Skeleton } from '../components/ui';
import { Field, useAction } from '../components/form';
import { phone } from '../utils/formats';

const Account = () => {
    const { data: me, loading } = useLoad(() => api.me(), []);
    const [run, busy] = useAction();
    const [f, setF] = useState({ current: '', password: '', confirm: '' });
    const [erro, setErro] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setErro('');
        if (f.password.length < 8) return setErro('A nova senha precisa ter ao menos 8 caracteres.');
        if (f.password !== f.confirm) return setErro('A confirmação não confere com a nova senha.');
        const r = await run(() => api.changePassword(f.current, f.password), 'Senha alterada');
        if (r) setF({ current: '', password: '', confirm: '' });
    };

    return (
        <>
            <PageHeader title="Minha conta" subtitle="Dados de acesso ao painel" />
            <div className='grid-2'>
                <section className='card'>
                    <h2>Dados da loja</h2>
                    {loading ? <Skeleton h={90} /> : (
                        <dl className='dl-grid'>
                            <dt>Nome</dt><dd>{me?.name}</dd>
                            <dt>Razão social</dt><dd>{me?.corporateName || '—'}</dd>
                            <dt>E-mail de acesso</dt><dd>{me?.email || '—'}</dd>
                            <dt>Telefone</dt><dd>{phone(me?.phone) || '—'}</dd>
                        </dl>
                    )}
                </section>
                <form className='card' onSubmit={submit} noValidate>
                    <h2>Trocar senha</h2>
                    {erro && <div className='alert-err'>{erro}</div>}
                    <Field label="Senha atual"><input type="password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} autoComplete="current-password" /></Field>
                    <Field label="Nova senha" hint="Mínimo de 8 caracteres"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /></Field>
                    <Field label="Repita a nova senha"><input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} autoComplete="new-password" /></Field>
                    <button type="submit" className='btn-primary' disabled={busy || !f.current || !f.password}>{busy ? 'Salvando…' : 'Salvar nova senha'}</button>
                </form>
            </div>
        </>
    );
};

export default Account;
