import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { BsCheckCircleFill, BsExclamationTriangleFill, BsInfoCircleFill, BsX } from 'react-icons/bs';

// Avisos rápidos (substituem os alert() do ADM antigo). Uso: const toast = useToast(); toast.ok('Salvo');
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const seq = useRef(0);

    const remove = useCallback((id) => setItems(list => list.filter(t => t.id !== id)), []);
    const push = useCallback((type, text, ms = 4500) => {
        const id = ++seq.current;
        setItems(list => [...list.slice(-3), { id, type, text }]);
        if (ms) setTimeout(() => remove(id), ms);
    }, [remove]);

    const api = useRef(null);
    api.current = {
        ok: (t, ms) => push('ok', t, ms),
        erro: (t, ms) => push('erro', t, ms ?? 7000),
        info: (t, ms) => push('info', t, ms),
    };
    const stable = useRef({
        ok: (...a) => api.current.ok(...a),
        erro: (...a) => api.current.erro(...a),
        info: (...a) => api.current.info(...a),
    }).current;

    const Icon = { ok: BsCheckCircleFill, erro: BsExclamationTriangleFill, info: BsInfoCircleFill };
    return (
        <ToastContext.Provider value={stable}>
            {children}
            <div className='tz' role="status" aria-live="polite">
                {items.map(t => {
                    const I = Icon[t.type];
                    return (
                        <div key={t.id} className={`tz-item tz-${t.type}`}>
                            <I aria-hidden="true" />
                            <span>{t.text}</span>
                            <button type="button" onClick={() => remove(t.id)} aria-label="Fechar aviso"><BsX /></button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
