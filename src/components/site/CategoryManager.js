import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Category from "../../api/categoryAndSubCategory";

const CategoryManager = ({ token }) => {
  const api = new Category();
  const topRef = useRef(null);
  const [categorias, setCategorias] = useState([]);

  // Categoria
  const [categoriaNome, setCategoriaNome] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState(null);

  // Subcategoria
  const [subNome, setSubNome] = useState("");
  const [editSubId, setEditSubId] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---------------------------
  // CARREGAR CATEGORIAS
  // ---------------------------
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.findAllCategory(token);

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
  }, []);

  // --------------------------------------------------
  // CRIAR / EDITAR CATEGORIA
  // --------------------------------------------------
  const handleAddCategoria = async (e) => {
    e.preventDefault();
    if (!categoriaNome.trim()) return;

    setSaving(true);
    try {
      if (editCategoriaId) {
        await api.update(editCategoriaId, { label: categoriaNome }, token);
      } else {
        await api.create({ label: categoriaNome }, token);
      }

      await loadCategories();

      setEditCategoriaId(null);
      setCategoriaNome("");
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategoria = async (id) => {
    if (!window.confirm("Excluir categoria e suas subcategorias?")) return;

    try {
      await api.delete(id, token);
      await loadCategories();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  };

  const editCategoria = (cat) => {
    setCategoriaNome(cat.nome);
    setEditCategoriaId(cat.id);

    window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // --------------------------------------------------
  // CRIAR / EDITAR SUBCATEGORIA
  // --------------------------------------------------
  const handleAddSubCategoria = async (e) => {
    e.preventDefault();
    if (!subNome.trim() || !parentCategoryId) return;
    console.log("AQUI")
    setSaving(true);
    try {
      if (editSubId) {
        await api.updateSubCategory(editSubId, { label: subNome }, token);
      } else {
        await api.createSubCategory(
          {
            label: subNome,
            id_category: parentCategoryId,
          },
          token
        );
      }

      await loadCategories();

      setSubNome("");
      setEditSubId(null);
      setParentCategoryId(null);
    } catch (error) {
      console.error("Erro ao salvar subcategoria:", error);
    } finally {
      setSaving(false);
    }
  };

  const editSubCategory = (sub, categoryId) => {
    setSubNome(sub.label);
    setEditSubId(sub.id_sub_category);
    setParentCategoryId(categoryId);

    window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir a subcategoria?"))
      return;

    try {
      await api.deleteSubCategory(id, token);
      await loadCategories();
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
    }
  };

  return (
    <div className="container py-4">
      <h2 ref={topRef} className="mb-4">
        Gerenciar Categorias
      </h2>

      {/* FORM CATEGORIA */}
      <div className="card mb-4">
        <div className="card-header">Categoria</div>
        <div className="card-body">
          <form onSubmit={handleAddCategoria}>
            <div className="mb-3">
              <label className="form-label">Nome da Categoria</label>
              <input
                type="text"
                className="form-control"
                value={categoriaNome}
                onChange={(e) => setCategoriaNome(e.target.value)}
              />
            </div>

            <button
              className="btn btn-secondary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Salvando..."
                : editCategoriaId
                ? "Salvar Alterações"
                : "Adicionar Categoria"}
            </button>
          </form>
        </div>
      </div>

      {/* FORM SUBCATEGORIA */}
      <div className="card mb-4">
        <div className="card-header">Subcategoria</div>
        <div className="card-body">
          <form onSubmit={handleAddSubCategoria}>
            <div className="mb-3">
              <label>Selecione a Categoria</label>
              <select
                className="form-select"
                value={parentCategoryId || ""}
                onChange={(e) => setParentCategoryId(Number(e.target.value))}
              >
                <option value="">Escolha...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Nome da Subcategoria</label>
              <input
                type="text"
                className="form-control"
                value={subNome}
                onChange={(e) => setSubNome(e.target.value)}
              />
            </div>

            <button className="btn btn-secondary" disabled={saving}>
              {saving
                ? "Salvando..."
                : editSubId
                ? "Salvar Alterações"
                : "Adicionar Subcategoria"}
            </button>
          </form>
        </div>
      </div>

      {/* LISTAGEM */}
      <h3 className="mb-3">Categorias Cadastradas</h3>

      {loading ? (
        <div className="alert alert-info">Carregando...</div>
      ) : categorias.length === 0 ? (
        <div className="alert alert-secondary">
          Nenhuma categoria encontrada.
        </div>
      ) : (
        categorias.map((cat) => (
          <div key={cat.id} className="card mb-3">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <strong>{cat.nome}</strong>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => editCategoria(cat)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteCategoria(cat.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* LISTA DE SUBCATEGORIAS */}
              {cat.subcategorias.length > 0 && (
                <ul className="list-unstyled px-0 px-md-3">
                  {cat.subcategorias.map((sub) => (
                    <li
                      key={sub.id_sub_category}
                      className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom py-2 gap-2 px-0"
                    >
                      <span className="fw-semibold">{sub.label}</span>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => editSubCategory(sub, cat.id)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteSubCategory(sub.id_sub_category)}
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
        ))
      )}
    </div>
  );
};

export default CategoryManager;
