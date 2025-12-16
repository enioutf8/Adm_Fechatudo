import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import { Accordion, Tabs, Tab } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Instalation from "../../api/Instalation";
import Category from "../../api/categoryAndSubCategory";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Product from "../../api/product";
import { FaCheckCircle } from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";

export default function InstallationForm({ token }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [installationCondition, setInstallationCondition] = useState("");
  const [warranty, setWarranty] = useState("");
  const [discount, setDiscount] = useState(0);
  const [timed, setTimed] = useState(Date.now());
  const [allInstalations, setAllInstalations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [editingId, setEditingId] = useState(null); // 🔥 controla modo edição
  const [load, setLoad] = useState(false);
  const [showProducts, setShowProducts] = useState([]);
  const [onlyProducts, setonlyProducts] = useState({});
  const [idInstallation, setIdInstallation] = useState(0);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = (prod) => {
    setonlyProducts(prod);
    setShow(true);
  };

  const instalationApi = new Instalation();
  const categoryApi = new Category();
  const productApi = new Product();

  // ------------------- CRIAR -------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      return handleEditSubmit(); // 🔥 agora funciona!
    }

    const data = {
      Title: title,
      Price: parseFloat(price),
      Installation_Condition: installationCondition,
      Discount: discount,
      Warranty: warranty,
    };

    const installationCreate = async () => {
      try {
        await instalationApi.createInstallation(data, token);
        setTimed(Date.now());
        resetForm(); // limpa após criar
      } catch (error) {
        console.log(error);
      }
    };

    installationCreate();
  };

  // ------------------- EDITAR -------------------
  const handleEditSubmit = () => {
    const dataEdit = {
      Installation_ID: editingId,
      Title: title,
      Price: parseFloat(price),
      Installation_Condition: installationCondition,
      Warranty: warranty,
      Discount: discount,
    };

    const installationEdit = async () => {
      try {
        const response = await instalationApi.editInstallation(dataEdit, token);
        setTimed(Date.now());
        resetForm(); // limpa após criar
        console.log("Enviar dados EDITADOS:", response);

        setEditingId(null);
      } catch (error) {
        console.log(error);
      }
    };

    installationEdit();
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setInstallationCondition("");
    setWarranty("");
    setDiscount(0);
    setEditingId(null);
  };

  // ------------------- BUSCAR -------------------
  const findAllInstallations = async () => {
    try {
      const response = await instalationApi.findAllInstallation(token);
      setAllInstalations(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteInstallation = async (installationId) => {
    try {
      await instalationApi.deleteInstallation(installationId, token);
      handleClose();
      handleSelectSubCategory();
      console.log(installationId);
      setTimed(Date.now());
    } catch (error) {
      console.log("Erro ao deletar instalação:", error);
    }
  };

  useEffect(() => {
    findAllInstallations();
  }, [timed]);

  useEffect(() => {
    const findSubCategory = async () => {
      if (activeTab === "addProduto") {
        const response = await categoryApi.findAllCategory();
        setAllCategories(response.data.data);
      }
    };
    findSubCategory();
  }, [activeTab]);

  const handleSelectSubCategory = async (sub) => {
 
    setLoad(true);
    const response = await productApi.findOnlyProduct(sub.label);
    setLoad(false);
    setShowProducts(response.showAllProducts);
  };

  const handleView = (product) => {
    const urlSite = `http://191.252.103.153/produto/${product.id_sub_category}/${product.Product_Slug}-${product.Product_ID}`;
    window.open(urlSite, "_blank"); // abre em nova aba
  };

  // Antes do return
  const installationOptions = allInstalations?.data?.map((ins) => ({
    value: ins.Installation_ID,
    label: `${ins.Title} - R$ ${Number(ins.Price)
      .toFixed(2)
      .replace(".", ",")}`,
  }));

  const changeIdInstallation = async (value) => {
    setIdInstallation(value.value);
  };
  const handleAddInstallationAndProduct = async (prod) => {
    const data = {
      Product_ID: prod,
      Installation_ID: idInstallation,
    };
    const productInstallationCreate = async () => {
      try {
        const response = await instalationApi.createInstallationAndProduct(
          data,
          token
        );
        console.log(response);
        setTimed(Date.now());
        setShow(false);
      } catch (error) {
        console.log(error);
      }
    };
    productInstallationCreate();
  };
  const handleDeleteInstallationProduct = async (item) => {
    try {
      const data = {
        Product_ID: item.ProductInstallation.Product_ID,
        Installation_ID: item.ProductInstallation.Installation_ID,
      };
      const response = await instalationApi.deleteInstallationAndProduct(
        data,
        token
      );
      setShow(false);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(showProducts);

  return (
    <div className="container mt-4">
      <Tabs
        onSelect={(key) => {
          setActiveTab(key);
        }}
        activeKey={activeTab}
        defaultActiveKey="cadastro"
        id="installation-tabs"
        className="mb-4"
      >
        {/* ------------- TAB CADASTRO ------------- */}
        <Tab eventKey="cadastro" title="Cadastro de Instalação">
          <div className="row">
            {/* ------------- FORMULÁRIO ------------- */}
            <div className="col-12 col-lg-6 mb-4">
              <form className="row g-4" onSubmit={handleSubmit}>
                {/* Título */}
                <div className="col-12">
                  <label className="form-label fw-bold">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Preço */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold">Preço</label>
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />

                  <label className="form-label fw-bold mt-3">
                    Desconto Unitário
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    required
                  />
                </div>

                {/* Garantia */}
                <div className="col-md-6 col-12">
                  <label className="form-label fw-bold">Garantia</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Condição */}
                <div className="col-12">
                  <label className="form-label fw-bold">
                    Condição de Instalação
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={installationCondition}
                    onChange={setInstallationCondition}
                  />
                </div>

                {/* Botões */}
                <div className="col-12 d-flex gap-2">
                  <button
                    className="btn btn-warning btn-lg w-100"
                    type="submit"
                  >
                    {editingId ? "Salvar Edição" : "Salvar Instalação"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg w-100"
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ------------- LISTA DE INSTALAÇÕES ------------- */}
            <div className="col-12 col-lg-6">
              <Accordion alwaysOpen={false}>
                {allInstalations?.data?.map((inst) => (
                  <Accordion.Item
                    eventKey={String(inst.Installation_ID)}
                    key={inst.Installation_ID}
                    className="mb-3 shadow-sm"
                  >
                    <Accordion.Header>
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <span style={{ fontSize: "1.2em", fontWeight: "600" }}>
                          {inst.Title} — R${" "}
                          {Number(inst.Price).toFixed(2).replace(".", ",")}
                        </span>

                        {/* Ações */}
                        <div className="ms-3 d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(inst.Installation_ID);
                              setTitle(inst.Title);
                              setPrice(inst.Price);
                              setInstallationCondition(
                                inst.Installation_Condition
                              );
                              setWarranty(inst.Warranty);
                              setDiscount(inst.Discount);

                              console.log("Modo edição →", inst);
                            }}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();

                              if (
                                window.confirm(
                                  `Tem certeza que deseja excluir "${inst.Title}"?`
                                )
                              ) {
                                handleDeleteInstallation(inst.Installation_ID);
                              }
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <p>
                        <strong>Preço: </strong> R$
                        {Number(inst.Price).toFixed(2).replace(".", ",")}
                      </p>

                      <h6 className="fw-bold mt-3">Condições:</h6>
                      <div
                        className="p-3 rounded bg-light border"
                        dangerouslySetInnerHTML={{
                          __html: inst.Installation_Condition,
                        }}
                      />

                      <h6 className="fw-bold mt-4">Garantia:</h6>
                      <div className="p-3 bg-light rounded border">
                        {inst.Warranty}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          </div>
        </Tab>

        {/* TAB PRODUTOS */}
        <Tab eventKey="addProduto" title="Adicionar ao Produto">
          <Accordion>
            {allCategories
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label)) // ordena categorias
              .map((cate, index) => {
                const parentKey = String(index);

                return (
                  <Accordion.Item eventKey={parentKey} key={cate.id || index}>
                    <Accordion.Header>
                      <strong>{cate.label}</strong>
                    </Accordion.Header>

                    <Accordion.Body>
                      {/* SUB-ACCORDION */}
                      <Accordion>
                        {cate.sub_category
                          .slice()
                          .sort((a, b) => a.label.localeCompare(b.label)) // ordena subcategorias
                          .map((sub, subIndex) => {
                            const subKey = `${parentKey}-${subIndex}`;

                            return (
                              <Accordion.Item
                                eventKey={subKey}
                                key={sub.id || subKey}
                              >
                                <Accordion.Header
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectSubCategory(sub);
                                  }}
                                >
                                  {sub.label}
                                </Accordion.Header>

                                <Accordion.Body>
                                  {load ? (
                                    <>Carregando...</>
                                  ) : (
                                    <>
                                      {showProducts.map((prod) => (
                                        <React.Fragment key={prod.Product_ID}>
                                          <p
                                            onClick={() => {
                                              handleShow(prod);
                                            }}
                                            className="form-control"
                                            style={{ cursor: "pointer" }}
                                          >
                                            {`${
                                              prod.Product_Name
                                            } - R$ ${Number(prod.Price)
                                              .toFixed(2)
                                              .replace(".", ",")}`}
                                            {prod.installation.length > 0 ? (
                                              <FaCheckCircle
                                                style={{
                                                  marginLeft: "5px",
                                                  fontSize: "1.3em",
                                                  marginBottom: "3px",
                                                  color: "#198754",
                                                }}
                                              />
                                            ) : (
                                              <>B</>
                                            )}
                                          </p>
                                        </React.Fragment>
                                      ))}
                                    </>
                                  )}
                                </Accordion.Body>
                              </Accordion.Item>
                            );
                          })}
                      </Accordion>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
          </Accordion>
        </Tab>
      </Tabs>
      <Modal
        size="lg"
        centered
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Visualizar:{" "}
            <a
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleView(onlyProducts);
              }}
              className="text-link"
            >
              {onlyProducts.Product_Name} {" - R$ "}
              {Number(onlyProducts.Price).toFixed(2).replace(".", ",")}
            </a>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Select
            options={installationOptions}
            placeholder="Pesquise a instalação..."
            isSearchable={true}
            onChange={(option) => {
              changeIdInstallation(option);
            }}
            styles={{
              menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
          <br></br>

          {onlyProducts?.installation?.length > 0 ? (
            <>
              <p className="text-center">
                Este produto já possui uma instalação:
                <FaCheckCircle
                  style={{
                    marginLeft: "5px",
                    fontSize: "1.3em",
                    marginBottom: "3px",
                    color: "#198754",
                  }}
                />
              </p>
              <ListGroup>
                {onlyProducts.installation.map((inst) => (
                  <ListGroup.Item
                    key={inst.Installation_ID}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {inst?.Title} -{" R$"}
                      {Number(inst?.Price).toFixed(2).replace(".", ",")}
                    </span>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteInstallationProduct(inst)}
                    >
                      Excluir
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <></>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleAddInstallationAndProduct(onlyProducts.Product_ID);
            }}
            variant="primary"
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
