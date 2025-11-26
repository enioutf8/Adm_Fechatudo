import React, { useContext, useEffect, useState } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import TechnicalSheet from "../../api/technicalSheet";
import Product from "../../api/product";
import ItemAdditional from "../../api/ItemAdditional";
import { TiDelete } from "react-icons/ti";
import axios from "axios";
import { GlobalContext } from "../../context/GlobalContext";
import Urlmaster from "../../api/urlMaster";

const TechnicalSections = ({ token }) => {
  const { timed, setTimed, productEdit } = useContext(GlobalContext);
  const url = new Urlmaster();
  const urlServidor = "/auth/";

  const [titleMainFeatures, setTitleMainFeatures] = useState("");
  const [valueMainFeatures, setValueMainFeatures] = useState("");
  const [titleItemIncluded, setTitleItemIncluded] = useState("");

  const [listItemAdditional, setListItemAdditional] = useState([]);
  const [listMainFacture, setListMainFacture] = useState([]);

  // 🖼️ NOVOS STATES
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [listImages, setListImages] = useState([]);

  const [selectedColor, setSelectedColor] = useState("#000000");
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

      console.log(productLocal);
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

  // 🔹 Adiciona característica principal
  const handleAddMainFacture = async () => {
    if (!titleMainFeatures?.trim() || !valueMainFeatures?.trim()) {
      alert(
        "Preencha o rótulo e o valor antes de adicionar uma característica!"
      );
      return;
    }

    const tenc = new TechnicalSheet();
    const reqMainFacture = {
      Label: titleMainFeatures.trim(),
      Value: valueMainFeatures.trim(),
    };

    try {
      // registra no backend
      const response = await tenc.registerMainFactureTechnicalSheet(
        reqMainFacture,
        token
      );

      // usa o retorno do backend se existir
      const savedFacture = response?.data?.mainFacture ||
        response?.mainFacture || {
          ...reqMainFacture,
          Main_Feature_ID: Date.now(),
        }; // fallback com ID único

      // Atualiza o estado local imediatamente (re-render)
      setListMainFacture((prev) => [...prev, savedFacture]);

      // Atualiza o localStorage
      const productLocalRaw = localStorage.getItem("technicalDataSubmit");
      let productLocal;

      // se não existir, cria uma estrutura inicial
      if (!productLocalRaw) {
        productLocal = {
          details: {
            main_features: [savedFacture],
          },
        };
      } else {
        productLocal = JSON.parse(productLocalRaw);
        productLocal.details = productLocal.details || {};
        productLocal.details.main_features =
          productLocal.details.main_features || [];
        productLocal.details.main_features.push(savedFacture);
      }

      // salva novamente no localStorage
      localStorage.setItem("technicalDataSubmit", JSON.stringify(productLocal));

      // limpa os campos
      setTitleMainFeatures("");
      setValueMainFeatures("");
    } catch (error) {
      console.error("Erro ao adicionar característica:", error);
      alert(
        "Erro ao adicionar característica. Veja o console para mais detalhes."
      );
    }
  };

  // 🔹 Adiciona item incluído
  const handleAddItemIncluded = async () => {
    if (!titleItemIncluded?.trim()) {
      alert("Digite o nome do item antes de adicioná-lo!");
      return;
    }

    const tenc = new TechnicalSheet();
    const reqItenIncluded = { Item: titleItemIncluded.trim() };

    await tenc.registerItemIncludedTechnicalSheet(reqItenIncluded, token);
    setListItemAdditional((prev) => [...prev, reqItenIncluded]);
    setTitleItemIncluded("");
  };

  // 🔹 Adiciona imagem
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

    const productLocal = JSON.parse(
      localStorage.getItem("technicalDataSubmit")
    );
    if (!productLocal?.Product_ID || !productLocal?.Product_Code) {
      alert("Produto inválido ou não encontrado!");
      return;
    }

    try {
      const productApi = new Product();

      const formData = new FormData();
      listImages.forEach((img) => {
        formData.append("fotos", img); // 👈 campo exigido: fotos
      });

      const response = await productApi.addImgsProduct(
        productLocal.Product_ID,
        productLocal.Product_Code,
        productLocal.Product_Name || "SemNome",
        formData,
        token
      );

      if (response.status === 200) {
        alert("Imagens enviadas com sucesso!");
        setListImages([]); // limpa após o envio
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

  const [item, setItem] = useState({
    Product_ID: 0,
    id_sub_category: 0,
    item_code: "",
    name: "",
    include: false,
    Description: "",
    Price: "",
    Old_price: "",
  });

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    setItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemAddtitional = new ItemAdditional();

    const productLocal = JSON.parse(
      localStorage.getItem("technicalDataSubmit")
    );

    const itemCustom = {
      Product_ID: productLocal.Product_ID,
      id_sub_category: productLocal.id_sub_category,
      item_code: item.item_code,
      name: item.name,
      include: item.include,
      Description: item.Description,
      Price: item.Price,
      Old_price: 0,
    };

    await itemAddtitional.registerItemAdditional(itemCustom, token);
    setTimed(Date.now());
  };

  const handleDeleteMainFeacture = async (mainFacture) => {
    try {
      if (!mainFacture) return;

      if (mainFacture.Main_Feature_ID) {
        const url = `/api/main-factures/${mainFacture.Main_Feature_ID}`;
        const response = await axios.delete(url);

        if (!(response.status === 200 || response.status === 204)) {
          console.error("Resposta inesperada do servidor:", response);
          alert("Erro ao remover no servidor. Veja o console.");
          return;
        }
      } else {
        console.warn(
          "Item sem Main_Feature_ID — removendo apenas localmente.",
          mainFacture
        );
      }

      const productLocalRaw = localStorage.getItem("technicalDataSubmit");
      if (!productLocalRaw) {
        console.error("Nenhum technicalDataSubmit no localStorage.");

        setListMainFacture((prev) =>
          prev.filter((item) =>
            mainFacture.Main_Feature_ID
              ? item.Main_Feature_ID !== mainFacture.Main_Feature_ID
              : item.Label !== mainFacture.Label
          )
        );
        return;
      }

      const productLocal = JSON.parse(productLocalRaw);

      const updatedFeatures = (
        productLocal.details?.main_features || []
      ).filter((item) =>
        mainFacture.Main_Feature_ID
          ? item.Main_Feature_ID !== mainFacture.Main_Feature_ID
          : item.Label !== mainFacture.Label
      );

      productLocal.details = productLocal.details || {};
      productLocal.details.main_features = updatedFeatures;
      localStorage.setItem("technicalDataSubmit", JSON.stringify(productLocal));

      setListMainFacture(updatedFeatures);

      alert("Característica removida com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar característica:", error);
      alert("Erro ao remover característica. Verifique o console.");
    }
  };

  const handleDeleteItemIncluded = async (itemAdditional) => {
    try {
      console.log(itemAdditional);
      if (!itemAdditional) return;

      // 🔹 Se o item tiver ID, remove no backend
      if (itemAdditional.Included_Item_ID) {
        const url = `/api/included-items/${itemAdditional.Included_Item_ID}`;
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

      // 🔹 Atualiza o localStorage
      const productLocalRaw = localStorage.getItem("technicalDataSubmit");
      if (productLocalRaw) {
        const productLocal = JSON.parse(productLocalRaw);

        const updatedItems = (
          productLocal.details?.technical_sheet?.included_items || []
        ).filter((item) =>
          itemAdditional.Included_Item_ID
            ? item.Included_Item_ID !== itemAdditional.Included_Item_ID
            : item.Item !== itemAdditional.Item
        );

        // Atualiza o objeto no localStorage
        productLocal.details = productLocal.details || {};
        productLocal.details.technical_sheet =
          productLocal.details.technical_sheet || {};
        productLocal.details.technical_sheet.included_items = updatedItems;

        localStorage.setItem(
          "technicalDataSubmit",
          JSON.stringify(productLocal)
        );
      }

      // 🔹 Atualiza o estado local (lista exibida)
      setListItemAdditional((prev) =>
        prev.filter((item) =>
          itemAdditional.Included_Item_ID
            ? item.Included_Item_ID !== itemAdditional.Included_Item_ID
            : item.Item !== itemAdditional.Item
        )
      );

      alert("Item removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar item adicional:", error);
      alert("Erro ao remover o item. Verifique o console.");
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
          "/api/product-img",
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
        const url = `/api/item-additional/${itemAdditional.Id_Item_additional}`;
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
    <div className="p-3">
      {/* Seção 3 - Características Principais */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="fw-bold mb-3">
            3. Recursos Principais
          </Card.Title>

          <Form>
            <Row className="align-items-end mb-3">
              <Col md={6}>
                <Form.Group controlId="label">
                  <Form.Label>Rótulo/Label</Form.Label>
                  <Form.Control
                    value={titleMainFeatures}
                    onChange={(e) => setTitleMainFeatures(e.target.value)}
                    type="text"
                    placeholder="Ex: Potência, Material Principal"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="value">
                  <Form.Label>Valor</Form.Label>
                  <Form.Control
                    value={valueMainFeatures}
                    onChange={(e) => setValueMainFeatures(e.target.value)}
                    type="text"
                    placeholder="Ex: 500W, Aço Inox"
                  />
                </Form.Group>
              </Col>
            </Row>

            <ul className="list-unstyled">
              {listMainFacture.map((item, index) => (
                <li
                  key={index + 800}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>
                    <strong>{item.Label}</strong> — {item.Value}
                  </div>
                  {productEdit && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: "32px", height: "32px" }}
                      title="Remover item"
                      onClick={() => handleDeleteMainFeacture(item)} // <--- substitua pela sua função de remoção
                    >
                      <TiDelete size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleAddMainFacture}
              variant="outline-secondary"
              className="w-100"
            >
              + Adicionar Característica
            </Button>
          </Form>
        </Card.Body>
      </Card>
      {/* Seção 4 - Itens e Acessórios Adicionais */}
      <Card className="mb-4">
        <Card.Body>
          <h4 className="fw-bold mb-3 text-center">4. Itens Inclusos</h4>
          <Form>
            <Row className="align-items-end mb-3">
              <Col md={6}>
                <Form.Group controlId="itemName">
                  <Form.Label>Nome do Item</Form.Label>
                  <Form.Control
                    value={titleItemIncluded}
                    onChange={(e) => setTitleItemIncluded(e.target.value)}
                    type="text"
                    placeholder="Ex: Cabo USB, Adaptador, Manual"
                  />
                </Form.Group>
              </Col>
            </Row>

            <ul>
              {listItemAdditional.map((item, index) => (
                <li
                  key={index + 200}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>{item.Item}</div>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: "32px", height: "32px" }}
                    title="Remover item"
                    onClick={() => handleDeleteItemIncluded(item)} // substitua pela função de remoção correta
                  >
                    <TiDelete size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleAddItemIncluded}
              variant="outline-secondary"
              className="w-100"
            >
              + Adicionar Item
            </Button>
          </Form>
        </Card.Body>
      </Card>
      {/* Seção 5 - Imagens, Cor e Ambiente */}
      <Card>
        <Card.Body>
          <h5 className="fw-bold mb-3 text-center">
            {" "}
            5. Adicionar Imagens, Cor e Tipo de Ambiente
          </h5>

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
                variant="outline-success"
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

          {/* Cor */}
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

          {/* Ambiente */}
          <Form.Group>
            <Form.Label>Tipo de Ambiente</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="checkbox"
                label="Interno"
                checked={envIndoor}
                onChange={(e) => setEnvIndoor(e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                label="Externo"
                checked={envOutdoor}
                onChange={(e) => setEnvOutdoor(e.target.checked)}
              />
              <Button
                variant="outline-secondary"
                onClick={handleAddEnvironment}
              >
                Adicionar
              </Button>
            </div>

            <ul className="mt-3">
              {listEnvironments.map((env, i) => (
                <li key={i}>{env.label}</li>
              ))}
            </ul>
          </Form.Group>
        </Card.Body>
      </Card>
      {/* Seção 6 - Imagens, Cor e Ambiente */}
      {productEdit ? (
        <Card className="p-4 mt-3">
          <h4 className="mb-3 text-center">Adicionar Item Opcional</h4>

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Código do Item</Form.Label>
                  <Form.Control
                    type="text"
                    name="item_code"
                    value={item.item_code}
                    onChange={handleChange}
                    placeholder="Ex: BAT4800"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={handleChange}
                    placeholder="Ex: Bateria Recarregável 4800mAh"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Incluir automaticamente"
                name="include"
                checked={item.include}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="Description"
                value={item.Description}
                onChange={handleChange}
                placeholder="Descreva o item..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preço Atual</Form.Label>
                  <Form.Control
                    type="number"
                    name="Price"
                    value={item.Price}
                    onChange={handleChange}
                    placeholder="Ex: 189.90"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="primary">
              + Adicionar Item
            </Button>

            <hr></hr>
            <ul className="list-unstyled">
              {listProducts?.item_additional?.map((item, index) => (
                <li
                  key={item.Id_Item_additional || index}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom py-3 gap-2"
                >
                  <div className="w-100">
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted small mb-1">
                      {item.Description}
                    </div>

                    <div className="d-flex flex-wrap gap-3 small">
                      <span>
                        <strong>Código:</strong> {item.item_code}
                      </span>
                      <span>
                        <strong>Preço:</strong> R$ {item.Price}
                      </span>
                      <span>
                        <strong>Preço Antigo:</strong> R$ {item.Old_price}
                      </span>
                      <span>
                        <strong>Incluído:</strong>{" "}
                        {item.include ? "Sim" : "Não"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px" }}
                    title="Remover item"
                    onClick={() => handleDeleteItemAdditional(item)}
                  >
                    <TiDelete size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </Form>
        </Card>
      ) : (
        <></>
      )}
    </div>
  );
};

export default TechnicalSections;
