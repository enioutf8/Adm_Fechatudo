import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { useAuth } from '../app/AuthContext';
import { errMsg } from '../api/client';
import logo from '../img/logo.png';

const Login = () => {
    const { token, login, sessionMsg } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [ver, setVer] = useState(false);
    const [busy, setBusy] = useState(false);
    const [erro, setErro] = useState('');

    if (token) return <Navigate to={location.state?.from || '/painel'} replace />;

    const submit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !senha) { setErro('Informe e-mail e senha.'); return; }
        setBusy(true); setErro('');
        try {
            await login(email.trim(), senha);
            navigate(location.state?.from || '/painel', { replace: true });
        } catch (err) {
            const status = err?.response?.status;
            setErro(status === 401 ? 'E-mail ou senha incorretos.' : errMsg(err, 'Não foi possível entrar.'));
        } finally { setBusy(false); }
    };

    return (
        <div className='lg'>
            <form className='lg-card' onSubmit={submit} noValidate>
                <img src={logo} alt="Fechatudo" className='lg-logo' />
                <h1>Área administrativa</h1>
                <p className='lg-sub'>Entre com o e-mail e a senha da loja.</p>
                {sessionMsg && !erro && <div className='alert-info'>{sessionMsg}</div>}
                {erro && <div className='alert-err' role="alert">{erro}</div>}
                <label className='fl'>
                    <span>E-mail</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
                </label>
                <label className='fl'>
                    <span>Senha</span>
                    <div className='fl-pass'>
                        <input type={ver ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
                        <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? <BsEyeSlash /> : <BsEye />}</button>
                    </div>
                </label>
                <button type="submit" className='btn-primary lg-btn' disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
            </form>
        </div>
    );
};

export default Login;
