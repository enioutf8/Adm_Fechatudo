import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Category from "../../api/categoryAndSubCategory";
import axios from "axios";
import Urlmaster from "../../api/urlMaster";

const SubCategoryLayout = ({ token }) => {
  const api = new Category();
  const urlmaster = new Urlmaster();
  const [layoutSubCategories, setLayoutSubCategories] = useState([]);
  const url = `${urlmaster.getUrlMaster().urlSite}`;

  // Estados
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timed, setTimed] = useState(Date.now());

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [subCategoriasFiltradas, setSubCategoriasFiltradas] = useState([]);
  const [editSub, setEditSub] = useState(false);
  const [form, setForm] = useState({
    id_layout_subcategories: null,
    id_sub_category: "",
    url_icon: "",
    url_direction: "",
    target_blank: false,
  });

  // ===============================
  // LOAD CATEGORIES + SUBCATEGORIES
  // ===============================
  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await api.findAllCategory();
      const lista = response.data.data || [];

      const adaptado = lista.map((cat) => ({
        id: cat.id_category,
        nome: cat.label,
        subcategorias: cat.sub_category || [],
      }));

      setCategorias(adaptado);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [timed]);

  // ===============================================================
  // FUNÇÃO NOVA — TROCAR CATEGORIA PROGRAMATICAMENTE (EDIT MODE)
  // ===============================================================
  const forceCategoriaChange = (idCategoria) => {
    const categoria = categorias.find((c) => c.id === idCategoria);

    setCategoriaSelecionada(idCategoria);

    if (categoria) {
      setSubCategoriasFiltradas(categoria.subcategorias);
    } else {
      setSubCategoriasFiltradas([]);
    }
  };

  // ===============================================================
  // SELECT NORMAL DE CATEGORIA (quando o usuário troca manualmente)
  // ===============================================================
  const handleCategoriaChange = (e) => {
    const id = Number(e.target.value);
    forceCategoriaChange(id);

    setForm((prev) => ({
      ...prev,
      id_sub_category: "",
    }));
  };

  // =================================
  // QUANDO SELECIONA A SUBCATEGORIA
  // =================================
  const handleSubCategoriaChange = (e) => {
    const subId = Number(e.target.value);

    setForm((prev) => ({
      ...prev,
      id_sub_category: subId,
    }));
  };

  // ===========================
  // INPUTS GERAIS
  // ===========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===========================
  // SUBMIT FORM
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlApi = form.id_layout
        ? `${urlmaster.getUrlMaster().urlApi}layout-subcategory/update`
        : `${urlmaster.getUrlMaster().urlApi}layout-subcategory`;

      await axios.post(urlApi, form);
      setTimed(Date.now());
      alert("Salvo com sucesso!");
      loadLayoutSubCategories();

      // limpa edição
      setForm({
        id_layout_subcategories: null,
        id_sub_category: "",
        url_icon: "",
        url_direction: "",
        target_blank: false,
      });
      setCategoriaSelecionada("");
      setSubCategoriasFiltradas([]);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar os dados.");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      console.log("AQUI");
      await api.updateSubCategoryLayout(form);

      // Se tiver imagem, envia o upload
      if (form.icon_file) {
        const formData = new FormData();
        formData.append(
          "id_layout_subcategories",
          form.id_layout_subcategories
        );
        formData.append("icon", form.icon_file);
        setTimed(Date.now());
        await api.updateSubCategoryIMG(formData);
      }

      // Limpa edição
      setForm({
        id_layout_subcategories: null,
        id_sub_category: "",
        url_icon: "",
        url_direction: "",
        target_blank: false,
      });

      setCategoriaSelecionada("");
      setSubCategoriasFiltradas([]);
      setEditSub(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar os dados.");
    }
  };

  // ===========================
  // CARREGA LISTA DE LAYOUTS
  // ===========================
  const loadLayoutSubCategories = async () => {
    try {
      const response = await axios.get(
        `${urlmaster.getUrlMaster().urlApi}layout-subcategory`
      );
      setTimed(Date.now());
      const lista = response.data.data || [];
      setLayoutSubCategories(lista);
    } catch (error) {
      console.error("Erro ao carregar layout das subcategorias:", error);
    }
  };

  useEffect(() => {
    loadLayoutSubCategories();
  }, [timed]);

  // ===========================
  // EDITAR ITEM
  // ===========================
  const handleEdit = (item) => {
    setEditSub(true);

    const sub = item.sub_category;
    if (!sub) return;

    const categoria = categorias.find((c) =>
      c.subcategorias.some((s) => s.id_sub_category === sub.id_sub_category)
    );

    if (categoria) {
      forceCategoriaChange(categoria.id);
    }

    setForm({
      id_layout_subcategories: item.id_layout_subcategories,
      id_sub_category: sub.id_sub_category,
      url_icon: item.url_icon || "",
      url_direction: item.url_direction || "",
      target_blank: item.target_blank || false,
    });
  };

  // Função para deletar a subcategoria
  const handleDelete = async (item) => {
    try {
      await api.deleteSubCategory(item.id_layout_subcategories);
      setLayoutSubCategories((prev) =>
        prev.filter((item2) => item2.id_sub_category !== item.id_sub_category)
      );
    } catch (error) {
      console.error("Erro ao deletar a subcategoria:", error);
    }
  };

  const handleChangeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      icon_file: file, // salvamos o arquivo no estado
    }));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Configurar Subcategoria</h3>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <form onSubmit={editSub ? handleSubmitEdit : handleSubmit}>
              {/* SELECT CATEGORIA */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Selecione a Categoria
                </label>
                <select
                  className="form-select"
                  value={categoriaSelecionada}
                  onChange={handleCategoriaChange}
                >
                  <option value="">Escolha...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECT SUBCATEGORIA */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Selecione a Subcategoria
                </label>
                <select
                  className="form-select"
                  value={form.id_sub_category}
                  onChange={handleSubCategoriaChange}
                  disabled={!categoriaSelecionada}
                >
                  <option value="">Escolha...</option>

                  {subCategoriasFiltradas.map((sub) => (
                    <option
                      key={sub.id_sub_category}
                      value={sub.id_sub_category}
                    >
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL ICON */}
              {editSub ? (
                <div className="mb-3">
                  <label className="form-label">Ícone (Upload)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleChangeFile}
                  />
                </div>
              ) : (
                <></>
              )}

              {/* URL DIRECTION */}
              <div className="mb-3">
                <label className="form-label">Direcionamento (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  name="url_direction"
                  value={form.url_direction}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/produto"
                />
              </div>

              {/* CHECKBOX */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="targetBlank"
                  name="target_blank"
                  checked={form.target_blank}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="targetBlank">
                  Abrir em nova aba
                </label>
              </div>

              <button type="submit" className="btn btn-warning w-100">
                {form.id_layout ? "Salvar Alterações" : "Salvar Configurações"}
              </button>

              {editSub && (
                <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => {
                    setEditSub(false);
                    setForm({
                      id_layout_subcategories: null,
                      id_sub_category: "",
                      url_icon: "",
                      url_direction: "",
                      target_blank: false,
                    });
                    setCategoriaSelecionada("");
                    setSubCategoriasFiltradas([]);
                  }}
                >
                  Cancelar Edição
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h4>Subcategorias Configuradas</h4>

        {layoutSubCategories.length === 0 ? (
          <p>Nenhum layout configurado ainda.</p>
        ) : (
          <ul className="list-group">
            {layoutSubCategories.map((item, index) => (
              <li
                key={index}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
              >
                {/* ESQUERDA — Ícone + textos */}
                <div className="d-flex align-items-center mb-3 mb-md-0">
                  {item.url_icon && (
                    <img
                      src={`${url}${item.url_icon}`}
                      alt="icon"
                      style={{
                        backgroundColor: "#e5e5e5",
                        padding: "5px",
                        marginRight: "20px",
                        width: 50,
                        height: 50,
                        objectFit: "contain",
                      }}
                    />
                  )}

                  <div>
                    <strong>{item.sub_category?.label}</strong>
                    <br />
                    <small>Direção: {item.url_direction || "—"}</small>
                  </div>
                </div>

                {/* BOTÕES */}

                <div className="d-flex">
                  <button
                    style={{ marginRight: "10px" }}
                    className="btn btn-outline-secondary"
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="btn btn-outline-danger"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SubCategoryLayout;
