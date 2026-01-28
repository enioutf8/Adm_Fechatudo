import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Category from "../../api/categoryAndSubCategory";
import Product from "../../api/product";
import Brands from "../../api/Brands";
import { GlobalContext } from "../../context/GlobalContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Quill from "quill";
import ResizeImage from "quill-resize-image";
import TechnicalSections from "./TechnicalSections";
Quill.register("modules/resizeImage", ResizeImage);

const ProductForm = ({ product, token }) => {
  const { setProductEdit, setRefreshProducList, timed, setTimed, productEdit } =
    useContext(GlobalContext);
  const navigate = useNavigate();

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    resizeImage: {}, // 👈 nome exato do módulo registrado
  };

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "header",
    "align",
    "list",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];
  const defaultTableHTML = ``;

  const categoryApi = new Category();
  const productApi = new Product();
  const brandsApi = new Brands();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoriesChange, setSubCategoriesChange] = useState("");
  const [selectedBrands, setSelectedBrands] = useState(1);
  const [selectedEnvironment, setSelectedEnvironment] = useState(1);

  const [prodcutName, setProductName] = useState("");
  const [brands, setBrands] = useState([]);
  const [prodcutDescription, setProductDescription] =
    useState(defaultTableHTML);
  const [productPrice, setProductPrice] = useState(999999);
  const [productDiscount, setProductDiscount] = useState(0);
  const [productStock, setProductStock] = useState(5);
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
        setBrands(await brandsApi.findAllBrands(token));

        if (data.length > 0) {
          setCategories(data);

          if (!productEdit) {
            setSelectedCategory(String(data[0].id_category));
            setSubCategories(data[0].sub_category || []);
            setSubCategoriesChange(
              String(data[0].sub_category?.[0]?.id_sub_category || "")
            );
          }
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
      setProductStock(savedProduct?.data?.stock?.[0]?.Quantity || 10);
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
  const handleChangeBrands = (brandId) => {
    setSelectedBrands(brandId);
    const findbrand = brands.find((item) => item.Id_brand == brandId);
  };

  const handleToggle = (e) => {
    setProductActive(e.target.checked);
  };

  useEffect(() => {
    if (!productEdit || !product?.id_sub_category || categories.length === 0) {
      return;
    }

    const subId = String(product.id_sub_category);

    const categoryFound = categories.find((cat) =>
      cat.sub_category?.some((sub) => String(sub.id_sub_category) === subId)
    );

    if (!categoryFound) return;

    setSelectedCategory(String(categoryFound.id_category));
    setSubCategories(categoryFound.sub_category);
    setSubCategoriesChange(subId);
  }, [productEdit, product, categories]);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    const sendProductData = {
      ...(productEdit && {
        Product_ID: product?.Product_ID ?? null,
      }),

      Id_brand: Number(selectedBrands),
      id_sub_category: Number(subCategoriesChange),
      Id_Environment: Number(selectedEnvironment),
      Product_Name: prodcutName,
      Description: prodcutDescription,
      Old_price: 0,
      Price: Number(productPrice),
      Unit_Discount: Number(productDiscount) || 0,
      Product_Code: "",
      stock: Number(productStock) || 10,
      Is_Active: productActive,
      ...(productEdit && {
        details: {
          sub_category: subCategoriesChange,
        },
      }),
    };

    if (productEdit) {
      const response = await productApi.editProduct(sendProductData, token);

      if (response) {
        localStorage.removeItem("productSubmit");
        //localStorage.setItem("productSubmit", JSON.stringify(response));
        alert("✅ Produto Editado com sucesso!");
        //const stored = localStorage.getItem("productSubmit");
        //setTimed(Date.now());
        setProductEdit(false);
        setRefreshProducList(false);
        //if (!stored) return;
        //const savedProduct = JSON.parse(stored);
        //setProductLastLocalStorage(savedProduct);
        setTimeout(() => setTimed(Date.now()), 10);
      }
    } else {
      const response = await productApi.registerNewProduct(
        sendProductData,
        token
      );

      if (response) {
        //localStorage.setItem("productSubmit", JSON.stringify(response));
        alert("✅ Produto salvo com sucesso!");
        localStorage.removeItem("productSubmit");
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setProductDiscount("");
        setProductStock("");
        //const stored = localStorage.getItem("productSubmit");
        //setTimed(Date.now());
        setRefreshProducList(false);
        //if (!stored) return;
        //const savedProduct = JSON.parse(stored);
        //setProductLastLocalStorage(savedProduct);
        setTimeout(() => setTimed(Date.now()), 10);
      }
    }
  };

  useEffect(() => {
    if (productEdit && product?.Id_brand) {
      setSelectedBrands(String(product.Id_brand));
    }
  }, [productEdit, product]);

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

            <label className="form-label fw-semibold">Marca *</label>
            <select
              className="form-control"
              value={selectedBrands}
              onChange={(e) => handleChangeBrands(e.target.value)}
            >
              <option value="">Selecione a marca</option>

              {brands.map((brand) => (
                <option key={brand.Id_brand} value={String(brand.Id_brand)}>
                  {brand.brand}
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
                  value={String(subCate.id_sub_category)}
                >
                  {subCate.label}
                </option>
              ))}
            </select>

            <label className="form-label fw-semibold">
              Ambiente de Instalação*
            </label>
            <select
              className="form-control"
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
            >
              <option value={1}>{"Interno"}</option>
              <option value={2}>{"Externo"}</option>
              <option value={3}>{"Todos"}</option>
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

            <ReactQuill
              theme="snow"
              value={prodcutDescription}
              onChange={setProductDescription}
              modules={modules}
              formats={formats}
              placeholder="Digite a descrição completa do produto"
              style={{ height: "max-content", marginBottom: "50px" }}
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

        {productEdit ? <TechnicalSections token={token} /> : <></>}

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
    </div>
  );
};

export default ProductForm;
