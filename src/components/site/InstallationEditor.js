import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Instalation from "../../api/Instalation";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Accordion,
} from "react-bootstrap";

export default function InstallationForm({ token }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [installationCondition, setInstallationCondition] = useState("");
  const [warranty, setWarranty] = useState("");
  const [discount, setDiscount] = useState(0);
  const [timed, setTimed] = useState(Date.now());

  const [allInstalations, setAllInstalations] = useState([]);
  const instalationApi = new Instalation();
  // ENVIAR JSON FINAL

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      Title: title,
      Price: parseFloat(price),
      Installation_Condition: installationCondition,
      Discount: discount,
      Warranty: warranty,
    };

    const installationCreate = async () => {
      try {
        const response = await instalationApi.createInstallation(data, token);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    installationCreate();
  };

  const findAllInstallations = async () => {
    try {
      const response = await instalationApi.findAllInstallation(token);
      setAllInstalations(response);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    findAllInstallations();
  }, [timed]);

  return (
    <div className="container mt-4">
      <form className="row g-4" onSubmit={handleSubmit}>
        {/* Título */}
        <div className="col-12">
          <label className="form-label fw-bold">Título</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Instalação de Ar-Condicionado"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        {/* Preço */}
        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Preço</label>
          <input
            type="number"
            className="form-control"
            placeholder="Ex: 199.90"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <label className="form-label fw-bold">Desconto Unitário</label>
          <input
            type="number"
            className="form-control"
            placeholder="Ex: 10"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
        </div>
        {/* Garantia */}
        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Garantia</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Descreva a garantia..."
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            required
          ></textarea>
        </div>
        {/* Condição de Instalação – com ReactQuill */}
        <div className="col-12">
          <label className="form-label fw-bold">Condição de Instalação</label>
          <ReactQuill
            theme="snow"
            value={installationCondition}
            onChange={setInstallationCondition}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
              ],
            }}
            placeholder="Descreva as condições de instalação..."
          />
        </div>
        {/* Botão */}
        <div className="col-12">
          <button className="btn btn-warning btn-lg w-100" type="submit">
            Salvar Instalação
          </button>
        </div>
      </form>
      {/* EXIBIR TODAS AS INSTALAÇÕES CADASTRADAS */}

      {allInstalations?.data?.map((inst) => (
        <React.Fragment key={inst.Installation_ID}>
          <br />
          <Accordion defaultActiveKey={null} className="mb-4 shadow-sm">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <span style={{ fontSize: "1.3em", fontWeight: "600" }}>
                  {inst.Title} -{" "}
                  <span style={{ fontSize: "1.05rem", color: "#222" }}>
                    R$ {Number(inst.Price).toFixed(2)}
                  </span>
                </span>
              </Accordion.Header>

              <Accordion.Body className="p-4">
                {/* Preço */}
                <div
                  className="mb-3"
                  style={{ fontSize: "1rem", color: "#444" }}
                >
                  <strong>Preço:</strong>{" "}
                  <span style={{ fontSize: "1.05rem", color: "#222" }}>
                    R$ {Number(inst.Price).toFixed(2)}
                  </span>
                </div>

                {/* Condições de Instalação */}
                <div
                  className="mb-2"
                  style={{ fontWeight: "600", fontSize: "1.1rem" }}
                >
                  Condições de Instalação:
                </div>

                <div
                  className="p-3 rounded"
                  style={{
                    background: "#fafafa",
                    border: "1px solid #e6e6e6",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: inst.Installation_Condition,
                  }}
                />

                {/* Garantia */}
                <div
                  className="mt-4 p-3 rounded bg-light"
                  style={{
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div style={{ fontSize: "1rem", color: "#444" }}>
                    <strong>Condições de Garantia:</strong> {inst.Warranty}
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </React.Fragment>
      ))}
    </div>
  );
}
