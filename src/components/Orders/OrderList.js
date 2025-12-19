import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Card } from "react-bootstrap";
import Orders from "../../api/order";
import Urlmaster from "../../api/urlMaster";
import "./OrderList.css";
export default function OrderList({ token }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [show, setShow] = useState(false);
  const [orderApi, setOrderApi] = useState([]);
  const [timed, setTimed] = useState(Date.now());
  const allOrders = new Orders();
  const urlMaster = new Urlmaster();

  useEffect(() => {
    const showOrdersPendent = async () => {
      const response = await allOrders.findOrdersPendent(token);
      const correctedOrders = response.map((order) => ({
        ...order,
        buy_cart:
          typeof order.buy_cart === "string"
            ? JSON.parse(order.buy_cart || "[]")
            : order.buy_cart,
      }));

      setOrderApi(correctedOrders);
    };
    showOrdersPendent();
  }, [timed]);

  const openModal = (order) => {
    setSelectedOrder(order);
    console.log(order);
    setShow(true);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} - ${hours}:${minutes}hrs`;
  };

  const handleView = (product) => {
    const urlSite = `https://www.fechatudo.com.br/produto/${product.id_sub_category}/${product.Product_Slug}-${product.Product_ID}`;
    window.open(urlSite, "_blank");
  };

  const finishedOrder = async (order) => {
    const data = {
      id_order: order.id_order,
      finished: new Date().toISOString(),
    };

    await allOrders.updateOrders(data, token);
    setTimed(Date.now());
    setShow(false);
  };

  function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, ""); // remove tudo que não é número

    if (cleaned.length === 11) {
      // formato (DD) 9XXXX-XXXX
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    }

    if (cleaned.length === 10) {
      // formato (DD) XXXX-XXXX
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
        6
      )}`;
    }

    return phone; // fallback caso não bata o tamanho
  }

  return (
    <div className="container py-4">
      <h3 className="mb-4">Pedidos</h3>

      <div className="table-responsive">
        <Table striped hover bordered>
          <thead className="table-dark">
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Pagamento</th>
              <th>Total</th>
              <th style={{ width: "120px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orderApi?.map((order) => (
              <tr key={order.id_order}>
                <td>#{order.id_order}</td>
                <td>{order.clients?.Name.split(" ").slice(0, 2).join(" ")}</td>

                <td>{order.payment}</td>
                <td>R$ {parseFloat(order.total_value).toFixed(2)}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => openModal(order)}
                    className="w-100"
                  >
                    Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal Melhorado */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalhes do Pedido #{selectedOrder?.id_order}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedOrder ? (
            <div className="row g-3">
              {/* Informações */}
              <div className="col-12">
                <div className="p-3 border rounded shadow-sm bg-white">
                  <h5 className="mb-3">Informações</h5>
                  <p>
                    <strong>Cliente:</strong> {selectedOrder.clients?.Name}
                  </p>
                  <p>
                    <strong>Contato:</strong>{" "}
                    {formatPhone(selectedOrder.clients?.Phone)}
                  </p>
                  <p>
                    <strong>Pagamento:</strong> {selectedOrder.payment}
                  </p>
                  <p>
                    <strong>Total:</strong> R${" "}
                    {parseFloat(selectedOrder.total_value).toFixed(2)}
                  </p>
                  <p>
                    <strong>Pedido Feito:</strong>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <button
                      onClick={() => {
                        finishedOrder(selectedOrder);
                      }}
                      className="btn btn-warning"
                    >
                      Finalizar Pedido
                    </button>
                  </p>
                </div>
              </div>

              {/* Observação */}
              <div className="col-12">
                <div className="p-3 border rounded shadow-sm bg-white">
                  <h5 className="mb-3">Observação</h5>
                  <p>{selectedOrder.observation || "Nenhuma observação"}</p>
                </div>
              </div>

              {/* Status */}
              <div className="col-12">
                <div className="p-3 border rounded shadow-sm bg-white">
                  <h5 className="mb-3">Produtos</h5>
                  {selectedOrder.buy_cart.map((product) => (
                    <React.Fragment key={product.Product_ID}>
                      <div className="table-responsive">
                        <table className="table table-bordered table-striped fixed-table">
                          <thead className="table-dark">
                            <tr>
                              <th style={{ width: "40%" }}>Nome</th>
                              <th style={{ width: "15%" }}>Qtd.</th>
                              <th style={{ width: "15%" }}>Preço (R$)</th>
                              <th style={{ width: "15%" }}> (%)</th>
                              <th style={{ width: "15%" }}>
                                Preço c/ Desc. (R$)
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* LINHA DO PRODUTO */}
                            <tr>
                              <td onClick={() => handleView(product.products)}>
                                <a
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                >
                                  {product.products.Product_Name}
                                </a>
                              </td>

                              <td>{product?.quantity}</td>

                              {/* Preço original */}
                              <td>
                                {parseFloat(product.products.Price)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </td>

                              {/* Desconto */}
                              <td>{product.products.Unit_Discount}</td>

                              {/* Preço com desconto */}
                              <td>
                                {(() => {
                                  const price = parseFloat(
                                    product.products.Price
                                  );
                                  const discount =
                                    parseFloat(
                                      product.products.Unit_Discount
                                    ) || 0;

                                  const finalPrice =
                                    price - price * (discount / 100);

                                  return finalPrice
                                    .toFixed(2)
                                    .replace(".", ",");
                                })()}
                              </td>
                            </tr>

                            {/* LINHA DE COMPLEMENTOS */}
                            <tr className="table-light">
                              <td colSpan={5} className="py-2 px-3">
                                <small className="text-muted">
                                  <strong>Solicitado:</strong>

                                  {product.complement ? (
                                    JSON.parse(product.complement).map(
                                      (comp, index) => (
                                        <div key={index} className="mt-1">
                                          • {comp.title}
                                          {comp.price && (
                                            <>
                                              {" "}
                                              —{" "}
                                              <strong>
                                                R${" "}
                                                {Number(comp.price)
                                                  .toFixed(2)
                                                  .replace(".", ",")}
                                              </strong>
                                            </>
                                          )}
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div>Nenhuma observação para este item</div>
                                  )}
                                </small>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Carregando...</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
