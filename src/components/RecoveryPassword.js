import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginComponent.css";

const RecoveryPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);

    const form = e.currentTarget;

    // 1. Validação do HTML5 (email obrigatório e tipo)
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    // Se a validação for OK:
    console.log("Email para recuperação:", email);

    // **AQUI você faria a chamada à API para enviar o email de recuperação**
    alert(
      `Se as informações estiverem corretas, um email de recuperação foi enviado para: ${email}`
    );

    // Limpar o campo e/ou redirecionar o usuário
    setEmail("");
    setValidated(false);
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-card p-4 shadow-lg rounded">
        <div className=" logo-login text-center mb-4 text-dark">
          <img src="/logo_sem_fundo_square.png" />
        </div>
        <h4 className="text-center mb-4 text-dark">Recuperar Senha</h4>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={validated ? "was-validated" : ""}
        >
          {/* Campo de Email */}
          <div className="mb-3">
            <label htmlFor="emailRecuperacao" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="emailRecuperacao"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              required
            />
            <div className="invalid-feedback">
              Por favor, informe um email válido.
            </div>
          </div>

          {/* Botão de Enviar */}
          <button type="submit" className="btn btn-dark w-100 mb-3 text-white">
            Enviar Link de Recuperação
          </button>
        </form>

        <hr />

        {/* Opção para voltar ao Login */}
        <div className="text-center">
          <button
            type="button"
            className="btn btn-link text-dark"
            onClick={handleBackToLogin}
            // Logica real: history.push('/login');
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPassword;
