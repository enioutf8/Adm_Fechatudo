import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import Urlmaster from "../../api/urlMaster";

const SubCategoryItemLayout = ({ token }) => {
  const url = new Urlmaster();
  const [formData, setFormData] = useState({
    id_sub_category: "",
    url_icon: "",
    url_direction: "",
    target_blank: false,
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Atualiza os campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Valida os campos antes do envio
  const validate = () => {
    let newErrors = {};

    if (!formData.id_sub_category) {
      newErrors.id_sub_category = "O ID da subcategoria é obrigatório.";
    } else if (isNaN(Number(formData.id_sub_category))) {
      newErrors.id_sub_category = "O ID deve ser um número válido.";
    }

    if (!formData.url_icon.trim()) {
      newErrors.url_icon = "A URL do ícone é obrigatória.";
    }

    if (!formData.url_direction.trim()) {
      newErrors.url_direction = "A URL de destino é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setSuccess(false);

      // 🔹 Aqui faz o envio para tua API
      await axios.post(
        `${url.getUrlMaster().urlApi}/subcategory`,
        formData,
        token
      );

      setSuccess(true);
      setFormData({
        id_sub_category: "",
        url_icon: "",
        url_direction: "",
        target_blank: false,
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Erro ao enviar formulário:", error);
      alert("Erro ao enviar. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid="md" className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h4 className="mb-3 text-center">Cadastrar Subcategoria</h4>

          {success && (
            <Alert
              variant="success"
              onClose={() => setSuccess(false)}
              dismissible
            >
              ✅ Dados enviados com sucesso!
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            {/* ID da Subcategoria */}
            <Form.Group controlId="id_sub_category" className="mb-3">
              <Form.Label>ID da Subcategoria</Form.Label>
              <Form.Control
                type="number"
                name="id_sub_category"
                value={formData.id_sub_category}
                onChange={handleChange}
                isInvalid={!!errors.id_sub_category}
                placeholder="Ex: 12"
              />
              <Form.Control.Feedback type="invalid">
                {errors.id_sub_category}
              </Form.Control.Feedback>
            </Form.Group>

            {/* URL de Direcionamento */}
            <Form.Group controlId="url_direction" className="mb-3">
              <Form.Label>URL de Destino</Form.Label>
              <Form.Control
                type="text"
                name="url_direction"
                value={formData.url_direction}
                onChange={handleChange}
                isInvalid={!!errors.url_direction}
                placeholder="Ex: https://meusite.com/produto"
              />
              <Form.Control.Feedback type="invalid">
                {errors.url_direction}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Target Blank */}
            <Form.Group controlId="target_blank" className="mb-4">
              <Form.Check
                type="checkbox"
                label="Abrir em nova aba"
                name="target_blank"
                checked={formData.target_blank}
                onChange={handleChange}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Dados"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SubCategoryItemLayout;
