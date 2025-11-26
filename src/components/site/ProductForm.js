import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Category from "../../api/categoryAndSubCategory";
import Product from "../../api/product";
import Brands from "../../api/Brands";
import ProductTechnicalForm from "./ProductTechnicalForm";
import { Button, Modal } from "react-bootstrap";
import { GlobalContext } from "../../context/GlobalContext";

const ProductForm = ({ product, token }) => {
  const { timed, setTimed, productEdit, currentMenuSelected } =
    useContext(GlobalContext);
  const navigate = useNavigate();

  const categoryApi = new Category();
  const productApi = new Product();
  const brandsApi = new Brands();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoriesChange, setSubCategoriesChange] = useState("");

  const [prodcutName, setProductName] = useState("");
  const [prodcutDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [productStock, setProductStock] = useState(0);
  const [productActive, setProductActive] = useState(true);

  const [productLastLocalStorage, setProductLastLocalStorage] = useState({});

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.findAllCategory(token);
        const data = response?.data?.data || [];
        console.log(data);
        if (data.length > 0) {
          setCategories(data);

          setSelectedCategory(data[0].id_category);
          setSubCategories(data[0].sub_category || []);
          setSubCategoriesChange(
            data[0].sub_category?.[0]?.id_sub_category || ""
          );
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const loadProductInLocalStorage = () => {
      const stored = localStorage.getItem("productSubmit");
      if (!stored) return;
      const tecSheet = localStorage.getItem("technicalDataSubmit");
      if (!tecSheet) return;

      const savedProduct = JSON.parse(stored);
      const savedSheet = JSON.parse(tecSheet);
      setProductLastLocalStorage(savedProduct);
      setProductName(savedProduct?.data?.Product_Name || "");
      setProductDescription(savedProduct?.data?.Description || "");
      setProductPrice(savedProduct?.data?.Price || 0);
      setProductDiscount(savedProduct?.data?.Unit_Discount || 0);
      setProductStock(savedSheet?.stock || 0);
      setProductActive(savedProduct?.data?.Is_Active ?? true);

      if (savedProduct.id_sub_category) {
        const categoryFound = categories.find((cat) =>
          cat.sub_category?.some(
            (sub) => sub.id_sub_category == savedProduct.id_sub_category
          )
        );

        if (categoryFound) {
          setSelectedCategory(categoryFound.id_category);
          setSubCategories(categoryFound.sub_category);
          setSubCategoriesChange(savedProduct.id_sub_category);
        }
      }
    };

    loadProductInLocalStorage();
  }, [categories, timed]);

  const handleChangeCategoryAndSubCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    const findCategory = categories.find(
      (item) => item.id_category == categoryId
    );
    const subCategoryList = findCategory?.sub_category || [];
    setSubCategories(subCategoryList);
    setSubCategoriesChange(subCategoryList[0]?.id_sub_category || "");
  };
  const handleToggle = (e) => {
    setProductActive(e.target.checked);
  };

  console.log(currentMenuSelected.subItem);
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (productEdit) {
      const sendProductData = {
        Product_ID: product.Product_ID,
        id_sub_category: subCategoriesChange,
        Product_Name: prodcutName,
        Description: prodcutDescription,
        Price: parseFloat(productPrice),
        Old_price: parseFloat(productPrice),
        Unit_Discount: parseInt(productDiscount),
        stock: parseInt(productStock),
        Is_Active: productActive,
        details: {
          sub_category: subCategoriesChange,
          technical_sheet: {},
          main_features: [],
          included_items: [],
        },
      };

      const response = await productApi.editProduct(sendProductData, token);

      if (response) {
        localStorage.setItem("productSubmit", JSON.stringify(response));
        alert("✅ Produto salvo com sucesso!");
      }
    } else {
      const sendProductData = {
        id_sub_category: subCategoriesChange,
        Product_Name: prodcutName,
        Description: prodcutDescription,
        Old_price: 0,
        Price: productPrice,
        Unit_Discount: parseInt(productDiscount),
        Product_Code: "",
        stock: parseInt(productStock),
        Is_Active: productActive,
      };

      const response = await productApi.registerNewProduct(
        sendProductData,
        token
      );

      if (response) {
        localStorage.setItem("productSubmit", JSON.stringify(response));
        alert("✅ Produto salvo com sucesso!");
        const stored = localStorage.getItem("productSubmit");
        if (!stored) return;
        const savedProduct = JSON.parse(stored);
        setProductLastLocalStorage(savedProduct);
        setTimeout(() => setTimed(Date.now()), 10);
      }
    }
  };

  const handleFinishProduct = async () => {
    setShow(false);
    await localStorage.removeItem("productSubmit");
    await localStorage.removeItem("technicalDataSubmit");
    setTimeout(() => setTimed(Date.now()), 10);
    navigate(0);
  };

  return (
    <div className="container mt-4">
      <form
        onSubmit={handleSubmitProduct}
        className="border rounded-3 shadow-sm p-4 bg-white"
      >
        <h4 className="text-center mb-4 fw-bold">
          1. Informações Básicas e Preço
        </h4>
        {/* Informações Gerais */}
        <h5 className="fw-semibold mb-3">Informações Gerais</h5>
        <div className="row g-3">
          {/* Categoria */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Categoria *</label>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) =>
                handleChangeCategoryAndSubCategory(e.target.value)
              }
            >
              {categories.map((cate) => (
                <option key={cate.id_category} value={cate.id_category}>
                  {cate.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoria */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Subcategoria *</label>
            <select
              className="form-control"
              value={subCategoriesChange}
              onChange={(e) => setSubCategoriesChange(e.target.value)}
            >
              {subCategories.map((subCate) => (
                <option
                  key={subCate.id_sub_category}
                  value={subCate.id_sub_category}
                >
                  {subCate.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nome do Produto */}
          <div className="col-12">
            <label className="form-label fw-semibold">Nome do Produto *</label>
            <input
              type="text"
              value={prodcutName}
              onChange={(e) => setProductName(e.target.value)}
              className="form-control"
              placeholder="Digite o nome do produto"
            />
          </div>

          {/* Descrição */}
          <div className="col-12">
            <label className="form-label fw-semibold">Descrição *</label>
            <textarea
              value={prodcutDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="form-control"
              rows={4}
              placeholder="Digite a descrição do produto"
            />
          </div>
        </div>
        <hr className="my-4" />
        {/* Preço e Controle */}
        <h5 className="fw-semibold mb-3">Preço e Controle</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Preço *</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 299.90"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Desconto Unitário (%) *
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 10"
              value={productDiscount}
              onChange={(e) => setProductDiscount(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Estoque *</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 50"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
            />
          </div>
        </div>
        {/* Toggle */}
        <div className="form-check form-switch mt-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="produtoAtivo"
            checked={productActive}
            onChange={handleToggle}
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor="produtoAtivo"
          >
            Produto Ativo
          </label>
        </div>
        {/* Botão */}
        {productLastLocalStorage.success ? (
          <></>
        ) : (
          <div className="text-end mt-4">
            <button type="submit" className="btn btn-warning fw-semibold px-4">
              Salvar Seção
            </button>
          </div>
        )}
      </form>
      {Object.keys(productLastLocalStorage).length === 0 ? (
        <></>
      ) : (
        <ProductTechnicalForm
          token={token}
          brands={brandsApi}
          productLocalStorage={productLastLocalStorage?.data}
        />
      )}

      {Object.keys(productLastLocalStorage).length > 0 ? (
        <div className="w-100  d-flex justify-content-center align-items-center">
          <Button variant="success btn-lg" onClick={handleShow}>
            Finalizar
          </Button>
        </div>
      ) : (
        <></>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>Finalizar Cadastro do Produto?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFinishProduct}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductForm;
