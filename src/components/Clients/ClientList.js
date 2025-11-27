import React, { useEffect, useState } from "react";

import {
  Modal,
  Button,
  Card,
  Table,
  Accordion,
  CardBody,
  CardHeader,
} from "react-bootstrap";
import Clients from "../../api/client";
import "../Orders/OrderList.css";
export default function ClientList({ token }) {
  const customURL = 'http://191.252.103.153:3000/'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [show, setShow] = useState(false);
  const [orderApi, setOrderApi] = useState([]);
  const [timed, setTimed] = useState(Date.now());
  const allOrders = new Clients();

  useEffect(() => {
    const showOrdersFinished = async () => {
      const response = await allOrders.findAllClients(token);
      setOrderApi(response);
      console.log(response);
    };
    showOrdersFinished();
  }, [timed]);

  const openModal = (order) => {
    setSelectedOrder(order);
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
  const formatDateOutHour = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const handleView = (product) => {
    const urlSite = `${customURL}produto/${product.id_sub_category}/${product.Product_Slug}-${product.Product_ID}`;
    window.open(urlSite, "_blank"); // abre em nova aba
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
      <h3 className="mb-4">Clientes Cadastrados</h3>

      <div className="table-responsive">
        <Table striped hover bordered>
          <thead className="table-dark">
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orderApi.map((order) => (
              <tr key={order?.id_client}>
                <td>{order?.Name.split(" ").slice(0, 2).join(" ")}</td>
                <td>{order?.Email}</td>
                <td>{formatPhone(order?.Phone)}</td>

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
        fullscreen
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <span className="me-3">{selectedOrder?.Name}</span>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          <Card>
            <CardHeader>Pedidos</CardHeader>
            <CardBody>
              <Accordion defaultActiveKey="0">
                {selectedOrder?.orders?.map((order, index) => (
                  <React.Fragment key={order?.id_order}>
                    <Accordion.Item eventKey={`${index}`}>
                      <Accordion.Header>
                        N° #{order?.id_order} - Total Pago: R${" "}
                        {parseFloat(order?.total_value)
                          .toFixed(2)
                          .replace(".", ",")}{" "}
                      </Accordion.Header>

                      <Accordion.Body>
                        {order?.buy_cart?.map((product) => (
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
                            <tr>
                              <td colSpan={5}>
                                {(() => {
                                  let complement = [];

                                  try {
                                    complement = JSON.parse(
                                      product.complement || "[]"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Erro ao parsear complement:",
                                      error
                                    );
                                  }

                                  const itensAdditional = complement
                                    .filter((item) => item.itensAdditional)
                                    .map((i) => i.itensAdditional);

                                  const color = complement.find(
                                    (item) => item.color
                                  )?.color;
                                  const environment = complement.find(
                                    (item) => item.environment
                                  )?.environment;

                                  return (
                                    <>
                                      {/* Cor e Ambiente */}
                                      <div>
                                        Cor e ambiente:{" "}
                                        {color ? color.name : "Padrão"} |{" "}
                                        {environment
                                          ? environment.name
                                          : "Padrão"}
                                      </div>

                                      <br />

                                      {/* Exibir itens adicionais SOMENTE SE EXISTIREM */}
                                      {itensAdditional.length > 0 && (
                                        <div>
                                          Itens adicionais:
                                          {itensAdditional.map(
                                            (item, index) => (
                                              <div key={index}>{item.name}</div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                            </div>
                          </React.Fragment>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  </React.Fragment>
                ))}
              </Accordion>
            </CardBody>
          </Card>
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
