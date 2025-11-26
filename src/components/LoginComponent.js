import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginComponent.css";
import LoginCompany from "../api/Login";

const LoginComponent = () => {
  const loginCompany = new LoginCompany();
  // Estado para armazenar os dados do formulário
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Estado para controlar se o usuário tentou enviar o formulário (para ativar as classes de validação do Bootstrap)
  const [validated, setValidated] = useState(false);

  // Função para atualizar o estado quando os campos mudam
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    setValidated(true);

    if (!form.checkValidity()) {
      return;
    }

    try {
      const response = await loginCompany.login(formData);
      console.log("Login OK:", response);
      localStorage.setItem("company", JSON.stringify(response?.company));
      localStorage.setItem("tokenCompany", response.token);
      alert(`Login bem-sucedido! Email: ${formData.email}`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleCadastro = () => {
    // 👈 Usamos navigate para ir para a rota /cadastro
    navigate("/register");
  };

  const handleAlterarSenha = () => {
    // 👈 Usamos navigate para ir para a rota /recuperar-senha
    navigate("/recovery-password");
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-card p-4 shadow-lg rounded">
        <div className=" logo-login text-center mb-4 text-dark">
          <img src="/logo_sem_fundo_square.png" />
        </div>

        {/* 1. 'noValidate': Desabilita a validação de feedback padrão do navegador.
          2. 'validated': Classe que o Bootstrap usa para exibir o feedback de erro após o envio.
        */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className={validated ? "was-validated" : ""}
        >
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
              placeholder="seu.email@exemplo.com"
              required // Validação de campo obrigatório (nulo)
            />
            {/* Feedback de erro do Bootstrap */}
            <div className="invalid-feedback">
              Por favor, informe um email válido.
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required // Validação de campo obrigatório (nulo)
              minLength="6" // Exemplo de validação de tamanho mínimo
            />
            <div className="invalid-feedback">
              A senha é obrigatória e deve ter pelo menos 6 caracteres.
            </div>
          </div>

          {/* Botão de Entrar (Submit) */}
          <button type="submit" className="btn btn-dark w-100 mb-3">
            Entrar
          </button>
        </form>

        <hr />

        {/* Opções de Cadastro e Alterar Senha */}
        <div className="text-center">
          {/*
          <p className="mb-2">Ainda não tem conta?</p>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={handleCadastro}
          >
            Cadastre-se
          </button>
        */}
          <button
            type="button"
            className="btn btn-link text-secondary"
            onClick={handleAlterarSenha}
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
