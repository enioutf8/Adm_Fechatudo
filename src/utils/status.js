// Situação do pedido, calculada pelas datas gravadas em cada etapa
export const STATUS_LABEL = {
    pendente: 'Novo',
    aprovado: 'Aprovado',
    faturado: 'Faturado',
    enviado: 'Enviado',
    finalizado: 'Concluído',
    cancelado: 'Cancelado',
};

export const orderStatus = (o) => {
    if (!o) return 'pendente';
    if (o.is_canceled_by_store || o.is_canceled_by_company) return 'cancelado';
    if (o.finished) return 'finalizado';
    if (o.send) return 'enviado';
    if (o.invoiced) return 'faturado';
    if (o.accepted) return 'aprovado';
    return 'pendente';
};

// Etapas na ordem, com o campo de data que cada uma grava
export const ORDER_STEPS = [
    { key: 'aprovado', field: 'accepted', label: 'Aprovar pedido' },
    { key: 'faturado', field: 'invoiced', label: 'Marcar como faturado' },
    { key: 'enviado', field: 'send', label: 'Marcar como enviado / instalado' },
    { key: 'finalizado', field: 'finished', label: 'Concluir pedido' },
];
