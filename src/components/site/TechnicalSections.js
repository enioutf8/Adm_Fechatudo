import React, { useContext, useEffect, useState } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import TechnicalSheet from "../../api/technicalSheet";
import Product from "../../api/product";
import ItemAdditional from "../../api/ItemAdditional";
import { TiDelete } from "react-icons/ti";
import axios from "axios";
import { GlobalContext } from "../../context/GlobalContext";
import Urlmaster from "../../api/urlMaster";
import ProductBannerForm from "../products/ProductBannerForm";

const TechnicalSections = ({ token }) => {
  const { timed, setTimed, productEdit } = useContext(GlobalContext);
  const urlMaster = new Urlmaster();
  const urlServidor = `${urlMaster.getUrlMaster().urlSite}`;
  const [productId, setProductId] = useState({});

  const [titleMainFeatures, setTitleMainFeatures] = useState("");
  const [valueMainFeatures, setValueMainFeatures] = useState("");
  const [titleItemIncluded, setTitleItemIncluded] = useState("");

  const [listItemAdditional, setListItemAdditional] = useState([]);
  const [listMainFacture, setListMainFacture] = useState([]);

  // 🖼️ NOVOS STATES
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [listImages, setListImages] = useState([]);

  const [selectedColor, setSelectedColor] = useState("#ffffffff");
  const [listColors, setListColors] = useState([]);
  const [colorName, setColorName] = useState("");

  const [envIndoor, setEnvIndoor] = useState(false);
  const [envOutdoor, setEnvOutdoor] = useState(false);
  const [listEnvironments, setListEnvironments] = useState([]);

  const [listProductImages, setListProductImages] = useState([]);
  const [listProducts, setListProducts] = useState({});

  useEffect(() => {
    const fetchProductData = async () => {
      const productAditionals = new Product();
      const productLocal = JSON.parse(
        localStorage.getItem("technicalDataSubmit")
      );

      setProductId(productLocal.Product_ID);

      if (!productLocal?.Product_Code) return;

      const response = await productAditionals.findOnlyProduct(
        productLocal.Product_Code,
        token
      );
      const sheet = response.showAllProducts?.[0]?.technical_sheet;

      if (sheet) {
        setListItemAdditional(productLocal.details.included_items || []);
        setListMainFacture(productLocal.details.main_features || []);
      }
    };

    fetchProductData();
  }, [timed]);

  useEffect(() => {
    const stored = localStorage.getItem("productSubmit");

    if (stored) {
      const parsed = JSON.parse(stored);
      setListProducts(parsed?.data);
      const imgs = parsed?.data?.product_img || [];
      setListProductImages(imgs);
    }
  }, []);

  // 🔹 Adiciona imagem localmente
  const handleAddImage = () => {
    if (!selectedImage) {
      alert("Selecione uma imagem antes de adicionar!");
      return;
    }

    setListImages((prev) => [...prev, selectedImage]);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // 🔹 Envia todas as imagens para o backend
  const handleSendImages = async () => {
    if (listImages.length === 0) {
      alert("Nenhuma imagem para enviar!");
      return;
    }

    const productLocal = JSON.parse(localStorage.getItem("productSubmit"));

    if (!productLocal?.data?.Product_ID) {
      alert("Produto inválido");
      return;
    }

    try {
      const productApi = new Product();

      const formData = new FormData();

      // 🔹 DADOS DO PRODUTO (ESSENCIAL)
      formData.append("Product_ID", productLocal.data.Product_ID);
      formData.append("Product_Code", productLocal.data.Product_Code);
      formData.append(
        "Product_Name",
        productLocal.data.Product_Name || "SemNome"
      );

      // 🔹 IMAGENS
      listImages.forEach((img) => {
        formData.append("fotos", img);
      });

      const response = await productApi.addImgsProduct(formData, token);

      if (response.status === 200) {
        alert("Imagens enviadas com sucesso!");
        setListImages([]);
      }
    } catch (error) {
      console.error("Erro ao enviar imagens:", error);
      alert("Falha ao enviar as imagens!");
    }
  };

  // 🔹 Pré-visualização ao selecionar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Adiciona cor
  const handleAddColor = async () => {
    if (!selectedColor || !colorName.trim()) return;
    const productLocal = JSON.parse(
      localStorage.getItem("technicalDataSubmit")
    );
    const productAditionals = new Product();

    const response = await productAditionals.findOnlyProduct(
      productLocal.Product_Code,
      token
    );

    const sheet =
      response.showAllProducts?.[0]?.technical_sheet.Technical_Sheet_ID;

    const newColor = {
      Technical_Sheet_ID: sheet, // ou substitua por um valor dinâmico
      color: colorName,
      cod_color: selectedColor,
    };

    await productAditionals.registerProductColor(newColor, token);
    setListColors((prev) => [...prev, newColor]);
    setColorName(""); // limpa o nome da cor
  };

  // 🔹 Adiciona ambiente
  const handleAddEnvironment = async () => {
    try {
      const environments = [];
      if (envIndoor) environments.push("Interno");
      if (envOutdoor) environments.push("Externo");

      if (environments.length === 0) {
        alert("Selecione pelo menos um tipo de ambiente!");
        return;
      }

      // 🔹 Recupera os dados locais e busca o ID técnico
      const productLocal = JSON.parse(
        localStorage.getItem("technicalDataSubmit")
      );
      const productAditionals = new Product();

      const response = await productAditionals.findOnlyProduct(
        productLocal.Product_Code,
        token
      );

      const sheet =
        response.showAllProducts?.[0]?.technical_sheet?.Technical_Sheet_ID;

      if (!sheet) {
        console.warn("⚠️ Nenhum Technical_Sheet_ID encontrado.");
        return;
      }

      // 🔹 Envia cada ambiente individualmente
      for (const env of environments) {
        const newEnv = {
          Technical_Sheet_ID: sheet,
          label: env,
        };

        console.log("📦 Enviando ambiente:", newEnv);
        await productAditionals.registerProductEnvironment(newEnv, token);

        // adiciona localmente apenas após o envio
        setListEnvironments((prev) => [...prev, newEnv]);
      }

      // 🔹 Reseta os checkboxes
      setEnvIndoor(false);
      setEnvOutdoor(false);
    } catch (error) {
      console.error("Erro ao adicionar ambiente:", error);
    }
  };

  const handleDeleteImage = async (imgToDelete) => {
    const stored = localStorage.getItem("productSubmit");
    if (!stored) return;

    try {
      if (!imgToDelete?.Id_Product_Imgs) {
        console.log(imgToDelete);
        console.warn("Imagem sem ID — remoção apenas local.");
      } else {
        // ✅ Corrigido: o corpo do DELETE vai dentro de "data"
        const response = await axios.delete(
          `${urlMaster.getUrlMaster().urlApi}product-img`,
          {
            data: { Id_Product_Imgs: imgToDelete.Id_Product_Imgs },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!(response.status === 200 || response.status === 204)) {
          console.error("Resposta inesperada do servidor:", response);
          alert("Erro ao remover imagem no servidor. Veja o console.");
          return;
        }
      }

      // 🔹 Atualiza localStorage e estado local
      const parsed = JSON.parse(stored);
      const imgs = parsed?.data?.product_img || [];

      const updatedImgs = imgs.filter(
        (img) => img.Id_Product_Imgs !== imgToDelete.Id_Product_Imgs
      );

      parsed.data.product_img = updatedImgs;
      localStorage.setItem("productSubmit", JSON.stringify(parsed));

      setListProductImages(updatedImgs);

      alert("Imagem removida com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      alert("Erro ao remover imagem. Verifique o console.");
    }
  };

  const handleDeleteItemAdditional = async (itemAdditional) => {
    try {
      console.log(itemAdditional);
      if (!itemAdditional) return;

      // 🔹 Se o item tiver ID, remove no backend
      if (itemAdditional.Id_Item_additional) {
        const url = `${urlMaster.getUrlMaster().urlApi}item-additional/${
          itemAdditional.Id_Item_additional
        }`;
        const response = await axios.delete(url);

        if (!(response.status === 200 || response.status === 204)) {
          console.error("Resposta inesperada do servidor:", response);
          alert("Erro ao remover o item no servidor. Veja o console.");
          return;
        }
      } else {
        console.warn(
          "Item sem Included_Item_ID — removendo apenas localmente.",
          itemAdditional
        );
      }

      alert("Item removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar item adicional:", error);
      alert("Erro ao remover o item. Verifique o console.");
    }
  };

  return (
    <div>
      <h4 className="text-center mb-4 fw-bold">2. Imagens e Cores.</h4>
      {/* Imagem */}
      <Form.Group className="mb-3">
        <Form.Label>Adicionar Imagem</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: "120px", borderRadius: "8px" }}
            />
          </div>
        )}
        <div className="d-flex gap-2 mt-2">
          <Button
            variant="outline-secondary"
            className="flex-fill"
            onClick={handleAddImage}
          >
            + Adicionar Imagem
          </Button>
          <Button
            variant="outline-dark"
            className="flex-fill"
            onClick={handleSendImages}
          >
            Enviar Imagens
          </Button>
        </div>

        <div className="mt-3 d-flex flex-wrap gap-2">
          {listImages.map((img, i) => (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              alt={`img-${i}`}
              style={{ width: "80px", borderRadius: "6px" }}
            />
          ))}
        </div>
      </Form.Group>

      {/* Imagens Existentes do Produto */}
      {listProductImages.length > 0 && (
        <div className="mb-4">
          <Form.Label className="fw-bold d-block text-center text-md-start">
            Imagens do Produto
          </Form.Label>
          <div
            className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 mt-3"
            style={{
              rowGap: "1rem",
            }}
          >
            {listProductImages.map((img, index) => (
              <div
                key={index}
                className="position-relative"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #ddd",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`${urlServidor}${img.url}`}
                  alt={img.name || `Imagem ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "10px",
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    top: "5px",
                    right: "5px",
                    borderRadius: "50%",
                    width: "26px",
                    height: "26px",
                    padding: 0,
                    lineHeight: 0,
                  }}
                  title="Remover imagem"
                  onClick={() => handleDeleteImage(img)}
                >
                  <TiDelete />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cor 
      <Form.Group className="mb-3">
        <Form.Label>Selecionar Cor</Form.Label>
        <div className="d-flex align-items-center gap-3">
          <Form.Control
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{ width: "60px", height: "40px", padding: "0" }}
          />

          <Form.Control
            type="text"
            placeholder="Nome da cor"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            style={{ maxWidth: "200px" }}
          />

          <Button variant="outline-secondary" onClick={handleAddColor}>
            Adicionar
          </Button>
        </div>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          {listColors.map((item, i) => (
            <div
              key={i}
              title={item.color}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "6px",
                backgroundColor: item.cod_color,
                border: "1px solid #ccc",
              }}
            ></div>
          ))}
        </div>
      </Form.Group>
    */}

      <ProductBannerForm productId={productId} />
    </div>
  );
};

export default TechnicalSections;
