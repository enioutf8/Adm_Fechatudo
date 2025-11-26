import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

export default function LayoutFooterCRUD() {
  const API = "http://191.252.103.153:3000/api/layout-footer";

  const [footerList, setFooterList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id_layout_Footer: null,
    label: "",
  });

  // Load on start
  useEffect(() => {
    loadFooter();
  }, []);

  // GET
  const loadFooter = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setFooterList(res.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar footer:", err);
    }
    setLoading(false);
  };

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // POST (create)
  const createFooter = async () => {
    if (!form.label.trim()) return alert("Digite um texto!");
    try {
      await axios.post(API, { label: form.label });
      setForm({ id_layout_Footer: null, label: "" });
      loadFooter();
    } catch (err) {
      console.error("Erro ao criar:", err);
    }
  };

  // PUT (edit)
  const updateFooter = async () => {
    if (!form.id_layout_Footer) return alert("Selecione um item para editar!");

    try {
      await axios.put(API, {
        id_layout_Footer: form.id_layout_Footer,
        label: form.label,
      });

      setForm({ id_layout_Footer: null, label: "" });
      loadFooter();
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    }
  };

  // DELETE
  const deleteFooter = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      loadFooter();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  // Fill form for edit
  const editItem = (item) => {
    setForm({
      id_layout_Footer: item.id_layout_Footer,
      label: item.label,
    });
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Gerenciar Footer</h5>

              <Form.Group className="mb-3">
                <Form.Label>Texto do Footer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="Digite o texto..."
                />
              </Form.Group>

              {form.id_layout_Footer ? (
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={updateFooter}
                >
                  Salvar Alterações
                </Button>
              ) : (
                <Button variant="warning" onClick={createFooter}>
                  Criar Novo
                </Button>
              )}

              {form.id_layout_Footer && (
                <Button
                  variant="secondary"
                  className="ms-2"
                  onClick={() => setForm({ id_layout_Footer: null, label: "" })}
                >
                  Cancelar
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <h5>Textos no Footer</h5>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            footerList.map((item) => (
              <Card key={item.id_layout_Footer} className="mb-3">
                <Card.Body>
                  <Form.Control rows={4} value={item.label} readOnly />

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => editItem(item)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="outline-danger"
                      onClick={() => deleteFooter(item.id_layout_Footer)}
                    >
                      Excluir
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}
