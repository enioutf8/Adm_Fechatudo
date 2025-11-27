import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BrandForm.css";
import Brands from "../../api/Brands";
export default function BrandForm({ token }) {
  const brandsApi = new Brands();
  const [timed, setTimed] = useState(Date.now());
  const [brandsList, setBrandsList] = useState([]);
  const [form, setForm] = useState({
    brand: "",
    img_path: "",
    url_direction: "",
    target_blank: false,
    color_cell: "#ffffffff",
  });
  const [jsonOutput, setJsonOutput] = useState(null);

  useEffect(() => {
    const listAllBrands = async () => {
      const brands = await brandsApi.findAllBrands(token);
      setBrandsList(brands);
    };
    listAllBrands();
  }, [timed]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJsonOutput(form); // Mostra JSON gerado
    await brandsApi.createBrand(form, token);
    setForm({
      brand: "",
      img_path: "",
      url_direction: "",
      target_blank: false,
      color_cell: "#ffffffff",
    });
    setTimed(Date.now());
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Deseja remover essa marca?")) return;

    try {
      await brandsApi.deleteBrand(id, token);
      setBrandsList((prev) => prev.filter((b) => b.Id_brand !== id));
      console.log(id);
      setTimed(Date.now());
    } catch (error) {
      console.error(error);
      alert("Erro ao remover marca!");
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4">Cadastrar Marca</h3>

        <form onSubmit={handleSubmit}>
          {/* Brand */}
          <div className="mb-3">
            <label className="form-label">Nome da Marca</label>
            <input
              type="text"
              className="form-control"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Ex: Pado"
              required
            />
          </div>

          {/* URL Image */}
          <div className="mb-3">
            <label className="form-label">URL da Imagem</label>
            <input
              type="text"
              className="form-control"
              name="img_path"
              value={form.img_path}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
          </div>

          {/* Preview */}
          {form.img_path && (
            <div className="mb-3 text-center">
              <img src={form.img_path} className="img-preview" alt="Preview" />
            </div>
          )}

          {/* URL Direction */}
          <div className="mb-3">
            <label className="form-label">URL Direcionamento</label>
            <input
              type="text"
              className="form-control"
              name="url_direction"
              value={form.url_direction}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
          </div>

          {/* Target Blank */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="target_blank"
              name="target_blank"
              checked={form.target_blank}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="target_blank">
              Abrir link em nova aba
            </label>
          </div>

          {/* Color Picker */}
          <div className="mb-3">
            <label className="form-label">Cor da Célula</label>
            <input
              type="color"
              className="form-control form-control-color"
              name="color_cell"
              value={form.color_cell}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-warning w-100">
            Cadastrar Marca
          </button>
        </form>
      </div>
      <br></br>
      <div className="card">
        <div className="card-body">
          <h3 className="mb-4">Cadastrados</h3>

          {brandsList.map((bd) => (
            <div
              key={bd.Id_brand}
              className="d-flex align-items-center justify-content-between mb-3 p-2 border rounded"
            >
              {/* Esquerda: imagem + nome da marca */}
              <div className="d-flex align-items-center">
                <div className="img-brand-list me-3">
                  <img
                    src={bd.img_path}
                    alt={bd.brand}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <strong>{bd.brand}</strong>
              </div>

              {/* Direita: botão remover */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteBrand(bd.Id_brand)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
