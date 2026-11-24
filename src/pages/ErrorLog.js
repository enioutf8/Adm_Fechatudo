import React, { useState } from 'react';
import { BsArrowClockwise, BsTrash, BsPlug, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import useLoad from '../app/useLoad';
import api from '../api/admin';
import { EmptyState, ErrorState, PageHeader, SkeletonRows } from '../components/ui';
import { useAction } from '../components/form';
import { dateTimeBR, timeAgo } from '../utils/formats';

const Check = ({ ok, children }) => (
    <span className={ok ? 'text-ok' : 'text-danger'}>{ok ? <BsCheckCircleFill /> : <BsXCircleFill />} {children}</span>
);

// Últimos erros do servidor (guardados desde que ele iniciou) + diagnóstico da integração
const ErrorLog = () => {
    const { data, loading, error, reload } = useLoad(() => api.errorLog(), []);
    const [open, setOpen] = useState(null);
    const [test, setTest] = useState(null);
    const [run, busy] = useAction();
    const s = data?.server || {};
    const errors = data?.errors || [];

    const testIsales = () => run(() => api.testIsales(), null, (r) => { setTest(r); return reload(); });

    return (
        <>
            <PageHeader title="Log de erros" subtitle="Erros do servidor desde que ele foi iniciado, para descobrir o que deu errado.">
                <button type="button" className='btn-ghost' onClick={() => reload()} disabled={loading}><BsArrowClockwise /> Atualizar</button>
                <button type="button" className='btn-danger-ghost' disabled={busy || !errors.length}
                    onClick={() => run(() => api.clearErrorLog(), 'Log limpo', reload)}><BsTrash /> Limpar</button>
            </PageHeader>

            {error ? <ErrorState text={error} onRetry={reload} /> : (
                <>
                    <section className='card'>
                        <div className='card-head'>
                            <h2>Diagnóstico</h2>
                            <button type="button" className='btn-primary btn-sm' disabled={busy} onClick={testIsales}><BsPlug /> {busy ? 'Testando…' : 'Testar conexão com o iSales - Api'}</button>
                        </div>
                        <dl className='dl-grid'>
                            <dt>Token do iSales - Api no servidor</dt>
                            <dd><Check ok={s.isalesToken}>{s.isalesToken ? 'Configurado' : 'Não configurado (falta TOKEN no .env do servidor)'}</Check></dd>
                            <dt>Versão do Node</dt>
                            <dd><Check ok={s.fetchDisponivel}>{s.node || '—'}{s.fetchDisponivel ? '' : ' — antiga demais: precisa do Node 18 ou mais novo'}</Check></dd>
                            <dt>Sincronização automática</dt>
                            <dd><Check ok={s.isalesSync}>{s.isalesSync ? 'Ligada' : 'Desligada (ISALES_SYNC_ENABLED no .env)'}</Check></dd>
                            <dt>E-mail (SMTP)</dt>
                            <dd><Check ok={s.smtp}>{s.smtp ? 'Configurado' : 'Não configurado (avisos e recuperação de senha não enviam)'}</Check></dd>
                            <dt>Última sincronização</dt>
                            <dd>{s.ultimaSincronizacao ? `${timeAgo(s.ultimaSincronizacao)}${s.erroUltimaSincronizacao ? ` — falhou: ${s.erroUltimaSincronizacao}` : ' — ok'}` : 'Nenhuma desde que o servidor iniciou'}</dd>
                            <dt>Servidor iniciado</dt>
                            <dd>{s.iniciadoEm ? `${dateTimeBR(s.iniciadoEm)} (${timeAgo(s.iniciadoEm)})` : '—'}</dd>
                        </dl>
                        {test && <div className={`${test.ok ? 'alert-info' : 'alert-err'} mt-3`}>{test.message}</div>}
                    </section>

                    <div className='card card-flush'>
                        <div className='tbl-wrap'>
                            <table className='tbl tbl-hover'>
                                <thead><tr><th>Quando</th><th>Origem</th><th>Erro</th></tr></thead>
                                <tbody>
                                    {loading ? <SkeletonRows cols={3} /> : errors.map((e, i) => (
                                        <React.Fragment key={`${e.at}-${i}`}>
                                            <tr className={`row-cursor ${open === i ? 'row-on' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
                                                <td className='nowrap'>{dateTimeBR(e.at)}<br /><small className='muted'>{timeAgo(e.at)}</small></td>
                                                <td><span className='pill'>{e.source}</span></td>
                                                <td><strong>{e.message}</strong></td>
                                            </tr>
                                            {open === i && e.detail && (
                                                <tr className='row-detail'>
                                                    <td colSpan={3}><pre style={{ whiteSpace: 'pre-wrap', fontSize: '.78rem', margin: 0, maxHeight: 360, overflow: 'auto' }}>{e.detail}</pre></td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!loading && !errors.length && <EmptyState title="Nenhum erro registrado" text="Faça a ação que deu erro (ex.: Sincronizar agora) e clique em Atualizar." />}
                    </div>
                </>
            )}
        </>
    );
};

export default ErrorLog;
