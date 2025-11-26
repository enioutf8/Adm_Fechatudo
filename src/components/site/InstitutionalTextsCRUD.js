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

export default function InstitutionalTextsCRUD() {
  const API_GET = "/api/texts-institutional";
  const API_BASE = "/api/texts-institutional";

  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário de criação
  const [newText, setNewText] = useState("");

  // Carregar textos
  const loadTexts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_GET);
      setTexts(res.data.data);
    } catch (err) {
      console.error("Erro ao carregar textos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTexts();
  }, []);

  // Criar
  const handleCreate = async () => {
    if (!newText.trim()) return alert("Digite um texto!");
    try {
      await axios.post(API_BASE, { label: newText });
      setNewText("");
      loadTexts();
    } catch (err) {
      console.error("Erro ao criar", err);
      alert("Erro ao criar texto.");
    }
  };

  // Editar
  const handleEdit = async (id, label) => {
    try {
      await axios.put(API_BASE, {
        id_texts_institutional: id,
        label,
      });

      loadTexts();
    } catch (err) {
      console.error("Erro ao editar", err);
      alert("Erro ao editar texto.");
    }
  };

  // Excluir
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este texto?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      loadTexts();
    } catch (err) {
      console.error("Erro ao excluir", err);
      alert("Erro ao excluir texto.");
    }
  };

  return (
    <Container fluid="md" className="py-4">
      <h3 className="mb-4 text-center">Textos Institucionais</h3>

      {/* Criar novo texto */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Criar novo texto</h5>
          <Form.Group className="mb-3">
            <Form.Label>Texto</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Digite um novo texto institucional..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          </Form.Group>
          <Button onClick={handleCreate} variant="warning">
            Adicionar texto
          </Button>
        </Card.Body>
      </Card>

      {/* Lista textos */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-4">
          {texts.map((txt) => (
            <Col md={12} key={txt.id_texts_institutional}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Parágrafo</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={txt.label}
                      onChange={(e) => {
                        const updated = [...texts];
                        const idx = updated.findIndex(
                          (t) =>
                            t.id_texts_institutional ===
                            txt.id_texts_institutional
                        );
                        updated[idx].label = e.target.value;
                        setTexts(updated);
                      }}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        handleEdit(txt.id_texts_institutional, txt.label)
                      }
                    >
                      Salvar
                    </Button>

                    <Button
                      variant="outline-danger"
                      onClick={() => handleDelete(txt.id_texts_institutional)}
                    >
                      Excluir
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
