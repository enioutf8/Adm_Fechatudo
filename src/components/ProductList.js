import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Image,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import ProductForm from "./site/ProductForm";
import { GlobalContext } from "../context/GlobalContext";
import Urlmaster from "../api/urlMaster";

// 🎨 Estilos Customizados para Responsividade da Tabela
// Esconde colunas menos prioritárias em telas muito pequenas
const mobileTableStyles = `
@media (max-width: 767px) {
  /* Oculta as colunas de Categoria, Subcategoria e Código em telas extra-pequenas */
  .table-responsive tbody td:nth-child(2),
  .table-responsive thead th:nth-child(2),
  .table-responsive tbody td:nth-child(3),
  .table-responsive thead th:nth-child(3),
  .table-responsive tbody td:nth-child(5),
  .table-responsive thead th:nth-child(5) {
    display: none;
  }
}

/* Garante que os botões tenham espaço em telas pequenas */
.mobile-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 5px; /* Espaçamento entre os botões */
}
`;

const ProductList = ({ token }) => {
  const { productEdit, setProductEdit } = useContext(GlobalContext);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [product, setProduct] = useState({});
  const urlMaster = new Urlmaster();
  // 🔹 Buscar produtos
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${urlMaster.getUrlMaster().urlApi}product-all-adm`,
        token
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  // 🔹 Excluir produto
  const handleDelete = async (id) => {
    console.log(id);
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(
          `${urlMaster.getUrlMaster().urlApi}product/${id}`,
          token
        );
        // Atualiza a lista removendo o produto excluído
        setProducts(products.filter((p) => p.Product_ID !== id));
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  };

  // 🔹 Visualizar produto
  const handleView = (product) => {
    const urlSite = `http://191.252.103.153/produto/${product.id_sub_category}/${product.Product_Slug}-${product.Product_ID}`;
    window.open(urlSite, "_blank"); // abre em nova aba
  };

  const handleEdit = (product) => {
    if (!product) return console.error("Produto inválido.");

    // 1️⃣ CRIA O OBJETO PRINCIPAL: productSubmit
    const productSubmitData = {
      Description: product.Description ?? "",
      Is_Active: product.Is_Active ?? false,
      Old_price: product.Old_price ?? "0.00",
      Price: product.Price ?? 0,
      Product_Code: product.Product_Code ?? "",
      Product_ID: product.Product_ID ?? 0,
      Product_Name: product.Product_Name ?? "",
      Product_Slug: product.Product_Slug ?? "",
      Unit_Discount: product.Unit_Discount ?? "0.00",
      id_sub_category: product.id_sub_category ?? 0,
      item_additional: product.item_additional ?? [],
    };

    setProduct(productSubmitData);

    // 2️⃣ MONTA O OBJETO TECHNICAL DATA COMPLETO
    const technical = product.technical_sheet ?? {};
    const details = {
      sub_category:
        product.sub_category?.id_sub_category ?? product.id_sub_category ?? 0,
      technical_sheet: {
        Id_brand: technical.Id_brand ?? "",
        Model: technical.Model ?? "",
        Barcode: technical.Barcode ?? "",
        Internal_Code: technical.Internal_Code ?? "",
        Reference: technical.Reference ?? "",
        Material: technical.Material ?? "",
        Finish: technical.Finish ?? "",
        Height: technical.Height ?? "",
        Width: technical.Width ?? "",
        Depth: technical.Depth ?? "",
        Weight: technical.Weight ?? "",
        Door_Thickness: technical.Door_Thickness ?? "",
        Operating_Temperature: technical.Operating_Temperature ?? "",
        Humidity: technical.Humidity ?? "",
        Power_Supply: technical.Power_Supply ?? "",
        Battery_Life: technical.Battery_Life ?? "",
        Connectivity: technical.Connectivity ?? "",
        User_Capacity: technical.User_Capacity ?? "",
        Update_Info: technical.Update_Info ?? "",
        Locking_Time: technical.Locking_Time ?? "",
        Id_Color_Product: technical.Id_Color_Product ?? "",
        Id_Environment: technical.Id_Environment ?? "",
        environment: technical.environment ?? [],
        color_product: technical.color_product ?? [],
        brands: technical.brands ?? {},
      },
      main_features: technical.main_features ?? [],
      included_items: technical.included_items ?? [],
    };

    // 3️⃣ MONTA technicalDataSubmit NO FORMATO FINAL
    const technicalDataSubmit = {
      Product_ID: product.Product_ID ?? 0,
      id_sub_category: product.id_sub_category ?? 0,
      Product_Name: product.Product_Name ?? "",
      Description: product.Description ?? "",
      Price: product.Price ?? 0,
      Old_price: product.Old_price ?? "0.00",
      Unit_Discount: product.Unit_Discount ?? "0.00",
      Product_Code: product.Product_Code ?? "",
      Is_Active: product.Is_Active ?? false,
      stock: product.stock?.Quantity ?? 0,
      details: details,
    };

    // 4️⃣ SALVA TUDO NO LOCAL STORAGE
    try {
      localStorage.setItem("productSubmit", JSON.stringify({ data: product }));
      localStorage.setItem(
        "technicalDataSubmit",
        JSON.stringify(technicalDataSubmit)
      );
      console.log("✅ Dados salvos com sucesso no localStorage para edição.");
    } catch (error) {
      console.error("❌ Erro ao salvar dados no localStorage:", error);
    }

    // 5️⃣ ABRE O MODAL (mantém seu fluxo)
    setSelected(product);
    setShowModal(true);
    setProductEdit(true);
  };

  // ... [código restante do componente]

  const handleExitModal = async () => {
    await localStorage.removeItem("productSubmit");
    await localStorage.removeItem("technicalDataSubmit");
    setShowModal(false);
    setProductEdit(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Container fluid className="mt-4 px-2 px-sm-3">
      {/* ⚠️ Inclusão dos Estilos Customizados */}
      <style>{mobileTableStyles}</style>

      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <h3 className="text-center mb-4">Lista de Produtos</h3>

          <div className="table-responsive">
            {/* A Tabela agora usa 'responsive="sm"' para melhor rolagem em telas pequenas,
                mas a mágica de esconder colunas está no CSS customizado. */}
            <Table
              striped
              bordered
              hover
              responsive="sm"
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Subcategoria</th>
                  <th>Preço</th>
                  <th>Código</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.Product_ID}>
                      {/* Nome: Visível em todas as telas */}
                      <td>{product.Product_Name}</td>
                      {/* Categoria, Subcategoria e Código: Ocultadas em telas < 768px pelo CSS */}
                      <td>{product.sub_category?.category?.label || "-"}</td>
                      <td>{product.sub_category?.label || "-"}</td>
                      {/* Preço: Visível em todas as telas */}
                      <td className="fw-bold text-success">
                        R$ {Number(product.Price).toFixed(2)}
                      </td>
                      <td>{product.Product_Code}</td>
                      {/* Ações: Usando a classe 'mobile-actions-stack' para empilhar botões em mobile */}
                      <td>
                        <div className="mobile-actions-stack">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleView(product)}
                            className="w-100" // w-100 força a largura total em todas as telas
                          >
                            Visualizar
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="w-100"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product.Product_ID)}
                            className="w-100"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* colSpan ajustado para 6, pois o CSS customizado só esconde, não remove as colunas */}
                    <td colSpan="6" className="text-center py-3">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* 🔹 Modal de Visualização */}
      <Modal
        show={showModal}
        onHide={handleExitModal}
        centered
        fullscreen={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <>
              <ProductForm token={token} product={product} />
            </>
          ) : (
            <p>Carregando...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleExitModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductList;
