import { useCallback, useEffect, useRef, useState } from 'react';
import { errMsg } from '../api/client';

/**
 * Carrega dados e ignora respostas antigas (ex.: troca rápida de aba/filtro não mostra dados da aba anterior).
 * const { data, loading, error, reload } = useLoad(() => api.pedidos(params), [JSON.stringify(params)]);
 */
const useLoad = (fn, deps = [], { keep = true } = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const seq = useRef(0);
    const fnRef = useRef(fn);
    fnRef.current = fn;

    const run = useCallback((silent = false) => {
        const my = ++seq.current;
        if (!silent) setLoading(true);
        setError('');
        if (!keep && !silent) setData(null);
        return Promise.resolve()
            .then(() => fnRef.current())
            .then(r => { if (my === seq.current) { setData(r); setLoading(false); } return r; })
            .catch(err => { if (my === seq.current) { setError(errMsg(err)); setLoading(false); } });
    }, [keep]);

    useEffect(() => { run(); }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, setData, loading, error, reload: run };
};

export default useLoad;
