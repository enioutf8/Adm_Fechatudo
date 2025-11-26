import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginComponent.css";
// Importe o CSS que você criou: import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);

    const form = e.currentTarget;

    // 1. Validação do HTML5 (campos obrigatórios e tipo)
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    // 2. Validação customizada: Senhas coincidem?
    if (formData.senha !== formData.confirmarSenha) {
      alert("Erro: As senhas não coincidem!");
      e.stopPropagation();
      return;
    }

    // Se tudo for OK:
    console.log("Dados de Cadastro a serem enviados:", formData);
    // **AQUI você faria a chamada à API para cadastrar o usuário**
    alert(`Cadastro bem-sucedido (Simulado)! Usuário: ${formData.nome}`);
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
        <h4 className="text-center mb-4 text-dark">Cadastre-se</h4>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={validated ? "was-validated" : ""}
        >
          {/* Campo de Nome */}
          <div className="mb-3">
            <label htmlFor="nome" className="form-label">
              Nome Completo
            </label>
            <input
              type="text"
              className="form-control"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">Por favor, informe seu nome.</div>
          </div>

          {/* Campo de Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">
              Por favor, informe um email válido.
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="mb-3">
            <label htmlFor="senha" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength="6"
            />
            <div className="invalid-feedback">
              A senha é obrigatória (mín. 6 caracteres).
            </div>
          </div>

          {/* Campo de Confirmação de Senha */}
          <div className="mb-3">
            <label htmlFor="confirmarSenha" className="form-label">
              Confirme a Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              // Adicione a verificação da senha aqui para o feedback visual
              // O JavaScript fará a validação final (handleSubmit)
              pattern={formData.senha}
            />
            <div className="invalid-feedback">
              As senhas devem ser idênticas.
            </div>
          </div>

          {/* Botão de Cadastrar */}
          <button type="submit" className="btn btn-dark w-100 mb-3">
            Finalizar Cadastro
          </button>
        </form>

        <hr />

        {/* Opção para voltar ao Login */}
        <div className="text-center">
          <p className="mb-2">Já tem uma conta?</p>
          <button
            type="button"
            className="btn btn-link text-primary"
            onClick={handleBackToLogin}
            // Logica real: history.push('/login');
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
