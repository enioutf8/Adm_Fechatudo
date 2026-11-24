import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import useLoad from '../../app/useLoad';
import { BackLink } from '../../app/nav';
import api from '../../api/admin';
import { siteUrl } from '../../api/client';
import { ErrorState, PageHeader, Skeleton, Tabs } from '../../components/ui';
import { DeleteButton } from '../../components/form';
import { productUrl } from '../../utils/formats';
import DataTab from './DataTab';
import MediaTab from './MediaTab';
import SheetTab from './SheetTab';
import InstallationsTab from './InstallationsTab';
import IsalesLinker from '../../components/IsalesLinker';

const TABS = [
    { key: 'dados', label: 'Dados' },
    { key: 'fotos', label: 'Fotos, vídeos e banners' },
    { key: 'especificacoes', label: 'Especificações' },
    { key: 'instalacoes', label: 'Instalações' },
    { key: 'isales', label: 'Preço e estoque (iSales)' },
];

const ProductEdit = () => {
    const { id } = useParams();
    const isNew = id === 'novo';
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const tab = isNew ? 'dados' : (params.get('aba') || 'dados');
    const { data: p, loading, error, reload } = useLoad(() => (isNew ? Promise.resolve(null) : api.adminProduct(id)), [id]);

    if (error) return <><BackLink fallbackTo="/produtos" fallbackLabel="Voltar para Produtos" /><ErrorState text={error} onRetry={reload} /></>;
    if (!isNew && (loading || !p)) return <Skeleton h={320} />;

    return (
        <>
            <BackLink fallbackTo="/produtos" fallbackLabel="Voltar para Produtos" />
            <PageHeader title={isNew ? 'Novo produto' : p.Product_Name} subtitle={isNew ? 'Preencha os dados; fotos e demais abas ficam disponíveis depois de salvar.' : `#${p.Product_ID}${p.Is_Active ? '' : ' · inativo (não aparece no site)'}`}>
                {!isNew && (
                    <>
                        <a className='btn-ghost' href={siteUrl(productUrl(p))} target="_blank" rel="noreferrer"><BsBoxArrowUpRight /> Ver no site</a>
                        <DeleteButton what={`o produto "${p.Product_Name}"`} label="Excluir"
                            effect="Fotos, banners, ficha técnica e vínculos do produto também serão apagados. Se o produto já estiver em algum pedido, ele não pode ser excluído — desative-o."
                            onConfirm={() => api.deleteProduct(p.Product_ID)} after={() => navigate('/produtos', { replace: true })} />
                    </>
                )}
            </PageHeader>
            {!isNew && <Tabs items={TABS} value={tab} onChange={(k) => setParams({ aba: k }, { replace: true })} />}

            {tab === 'dados' && <DataTab product={p} onSaved={(saved) => (isNew ? navigate(`/produtos/${saved.Product_ID}?aba=fotos`, { replace: true }) : reload())} />}
            {tab === 'fotos' && <MediaTab product={p} reload={reload} />}
            {tab === 'especificacoes' && <SheetTab product={p} reload={reload} />}
            {tab === 'instalacoes' && <InstallationsTab product={p} reload={reload} />}
            {tab === 'isales' && <section className='card'><IsalesLinker product={p} onChange={reload} /></section>}
        </>
    );
};

export default ProductEdit;
