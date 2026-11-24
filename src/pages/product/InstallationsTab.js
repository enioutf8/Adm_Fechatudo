import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsPlusLg } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import api from '../../api/admin';
import { DeleteButton, useAction } from '../../components/form';
import { money } from '../../utils/formats';

// Serviços de instalação oferecidos junto com o produto (o cliente escolhe na página do produto)
const InstallationsTab = ({ product, reload }) => {
    const { data: all } = useLoad(() => api.installations(), []);
    const [run, busy] = useAction();
    const [pick, setPick] = useState('');
    const linked = product.installations || [];
    const available = (all || []).filter((i) => !linked.some((l) => l.Installation_ID === i.Installation_ID));

    return (
        <section className='card'>
            <div className='card-head'>
                <h2>Instalações oferecidas</h2>
                <Link to="/instalacoes" className='btn-link'>Gerenciar serviços</Link>
            </div>
            <p className='muted'>O cliente pode incluir a instalação ao comprar este produto.</p>
            <div className='form-row'>
                <label className='fl'>
                    <span>Adicionar serviço</span>
                    <select value={pick} onChange={(e) => setPick(e.target.value)}>
                        <option value="">Escolha…</option>
                        {available.map((i) => <option key={i.Installation_ID} value={i.Installation_ID}>{i.Title} — {money(i.Price)}</option>)}
                    </select>
                </label>
                <button type="button" className='btn-ghost' disabled={!pick || busy}
                    onClick={() => run(() => api.linkInstallation(product.Product_ID, Number(pick)), 'Instalação adicionada', () => { setPick(''); return reload(); })}>
                    <BsPlusLg /> Adicionar
                </button>
            </div>
            {linked.length ? (
                <table className='tbl tbl-compact'>
                    <tbody>
                        {linked.map((i) => (
                            <tr key={i.Installation_ID}>
                                <td><strong>{i.Title}</strong></td>
                                <td className='r'>{money(i.Price)}</td>
                                <td className='r'>
                                    <DeleteButton what={`a instalação "${i.Title}" deste produto`} effect="O serviço continua existindo; só deixa de ser oferecido neste produto."
                                        onConfirm={() => api.unlinkInstallation(product.Product_ID, i.Installation_ID)} after={reload} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className='muted'>Nenhuma instalação vinculada.</p>}
        </section>
    );
};

export default InstallationsTab;
