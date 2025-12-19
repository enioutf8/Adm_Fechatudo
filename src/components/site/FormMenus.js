import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import {
  Form,
  Button,
  Container,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./FormMenus.css";
import MenusNavBar from "../../api/menuNavbar";

const defaultMenus = [
  {
    id: 1,
    name: "Produtos",
    submenus: [
      "Eletrônicos",
      "Livros",
      "Roupas",
      "Brinquedos",
      "Esportes",
      "Ferramentas",
      "Jardinagem",
      "Alimentos",
      "Bebidas",
      "Limpeza",
      "Petshop",
    ],
    isEditing: false,
    tempName: "Produtos",
  },
  {
    id: 2,
    name: "Serviços",
    submenus: ["Consultoria", "Suporte Técnico"],
    isEditing: false,
    tempName: "Serviços",
  },
];

const FormMenus = ({ token }) => {
  const [menus, setMenus] = useState(defaultMenus);
  const [urlEditMenus, setUrlEditMenus] = useState({});
  const [newMenuName, setNewMenuName] = useState("");
  const [newSubitemName, setNewSubitemName] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [timedMenusNavBar, setTimedMenusNavBar] = useState(Date.now());
  //API
  const navBarApi = new MenusNavBar();

  useEffect(() => {
    const nas = async () => {
      try {
        const response = await navBarApi.findMenusNavbar(token);
        const formattedMenus = response.map((item) => ({
          id: item.id_layout_navbar,
          name: item.label,
          url: item.url,
          active: item.active,
          submenus: item.layout_submenu.map((submenu) => ({
            id_layout_navbar: submenu.id_layout_navbar,
            id_submenu: submenu.id_layout_submenu,
            label: submenu.label,
            url: submenu.url,
            active: submenu.active,
          })),
          isEditing: false,
          tempName: item.label,
        }));
        setMenus(formattedMenus);
      } catch (error) {
        console.error("Erro ao carregar menus:", error);
        setMenus(defaultMenus);
      }
    };

    nas();
  }, [timedMenusNavBar]);

  const [editingSubitem, setEditingSubitem] = useState({
    menuId: null,
    oldName: null,
    tempName: "",
    tempUrl: "",
  });

  // --- Funções de Edição de Menu Principal ---

  const handleStartEdit = (menuId) => {
    handleCancelSubitemEdit();
    setMenus(
      menus.map((menu) =>
        menu.id === menuId
          ? { ...menu, isEditing: true, tempName: menu.name }
          : { ...menu, isEditing: false }
      )
    );
  };

  const handleEditChange = (menuId, newName) => {
    setMenus(
      menus.map((menu) =>
        menu.id === menuId ? { ...menu, tempName: newName } : menu
      )
    );
  };

  const handleSaveEdit = async (menu) => {
    const transformedMenu = {
      id_layout_navbar: menu.id,
      label: menu.tempName || menu.name, // usando tempName se estiver editando
      url: urlEditMenus[menu.id] || menu.url,
      active: menu.active,
      subMenus: menu.submenus.map((sub) => ({
        id_layout_submenu: sub.id_submenu,
        id_layout_navbar: menu.id,
        label: sub.label,
        url: sub.url == null ? "/" : sub.url,
        active: sub.active,
      })),
    };

    await navBarApi.editMenusNavbar(transformedMenu, token);
    setTimedMenusNavBar(Date.now());
    setNewMenuName("");
  };

  // Inicia a edição de um submenu
  const handleStartSubitemEdit = (menuId, subitemName, menu0) => {
    // Ao iniciar a edição de submenu, cancela qualquer edição de menu principal
    setMenus(menus.map((menu) => ({ ...menu, isEditing: false })));

    setEditingSubitem({
      menuId: menuId,
      oldName: subitemName,
      tempName: subitemName,
      tempUrl: menu0.url,
    });
  };

  // Salva a edição de um submenu
  const handleSaveSubitemEdit = async (menu, submenu) => {
    const { tempName, tempUrl } = editingSubitem;

    const updatedMenu = {
      id_layout_navbar: menu.id,
      label: menu.name,
      url: menu.url,
      active: menu.active,
      subMenus: [
        {
          id_layout_submenu: submenu.id_submenu,
          id_layout_navbar: menu.id,
          label: tempName,
          url: tempUrl,
          active: submenu.active,
        },
      ],
    };

    await navBarApi.editMenusNavbar(updatedMenu, token);
    setTimedMenusNavBar(Date.now());
    setEditingSubitem({
      menuId: null,
      oldName: "",
      tempName: "",
    });
  };

  // Cancela a edição de um submenu
  const handleCancelSubitemEdit = () => {
    setEditingSubitem({ menuId: null, oldName: null, tempName: "" });
  };

  // --- Funções de Adição/Remoção (Manter) ---

  const handleAddMenu = async (e) => {
    e.preventDefault();

    if (newMenuName.trim()) {
      const newMenu = {
        label: newMenuName.trim(),
        subMenus: [],
        url: "",
        active: true,
      };

      await navBarApi.registerMenusNavbar(newMenu, token);
      setTimedMenusNavBar(Date.now());
      setNewMenuName("");
    }
  };

  const handleDeleteMenu = async (id) => {
    const findSubMenus = menus.find((item) => item.id === id);
    const subMenuIds =
      findSubMenus?.submenus?.map((submenu) => submenu.id_submenu) || [];

    const menuDelete = {
      id_layout_navbar: id,
      ids_submenus: subMenuIds,
    };
    await navBarApi.deleteMenusNavbar(menuDelete, token);
    setTimedMenusNavBar(Date.now());
    setNewMenuName("");
  };

  const handleAddSubitem = async (menu, e) => {
    e.preventDefault();

    const newLabel = newSubitemName[menu.id]?.trim();
    if (!newLabel) return;

    const payload = {
      label: menu.name,
      url: "",
      active: "",
      subMenus: [
        {
          id_layout_navbar: menu.id,
          label: newLabel,
          url: "",
          active: true,
        },
      ],
    };

    await navBarApi.registerSubMenusNavbar(payload, token);

    setTimedMenusNavBar(Date.now());
    setNewSubitemName((prev) => ({ ...prev, [menu.id]: "" }));
  };

  const handleRemoveSubitem = async (menuId, subitem) => {
    const dataDelete = { subMenuIds: [subitem] };
    await navBarApi.deleteSubMenusNavbar(dataDelete, token);
    setTimedMenusNavBar(Date.now());
  };

  const handleLogoUpload = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmitAll = (e) => {
    e.preventDefault();
    // Remove os campos de controle de UI (isEditing, tempName) antes de enviar
    const dataToSend = menus.map(({ isEditing, tempName, ...rest }) => rest);
    const formData = new FormData();
    formData.append("menus", JSON.stringify(dataToSend));
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    console.log("--- Dados de Menus a serem enviados ---", dataToSend);
    if (logoFile) {
      console.log(`--- Logo a ser enviada: ${logoFile.name} ---`);
    } else {
      console.log("--- Nenhuma nova logo selecionada ---");
    }

    alert("Dados prontos para envio (Verifique o console)");
  };

  // --- Renderização (JSX) com Flexbox ---

  return (
    <Container>
      <div className="  d-flex flex-column flex-lg-row  ">
        {/* 1. Área de Cadastro (Esquerda em Desktop) */}
        <div
          style={{ height: "max-content", position: "sticky", top: "0" }}
          className="flex-grow-2 me-lg-4 mb-4 mb-lg-0 p-3 border rounded bg-light "
        >
          <h5>Cadastrar de Novos Menus</h5>
          <hr />
          <Form onSubmit={handleSubmitAll}>
            {/* Adicionar NOVO Menu */}
            <Form.Group className="mb-4">
              <Form.Label>Nome do Novo Menu Principal</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Ex: Novidades"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleAddMenu}
                  disabled={!newMenuName.trim()}
                >
                  Adicionar
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>
        </div>

        {/* 2. Área de Edição/Itens Existentes (Direita em Desktop) */}
        <div className=" flex-grow-1  ">
          <ListGroup>
            {menus.map((menu) => (
              <ListGroup.Item key={menu.id} className="d-flex flex-column mb-3">
                {/* ÁREA DE NOME DO MENU (EDIÇÃO OU VISUALIZAÇÃO) */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  {menu.isEditing ? (
                    // MODO EDIÇÃO DO MENU PRINCIPAL
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={menu.tempName}
                        onChange={(e) =>
                          handleEditChange(menu.id, e.target.value)
                        }
                      />
                      <Form.Control
                        type="text"
                        placeholder="Adicione Link de navegação"
                        value={urlEditMenus[menu.id] ?? menu.url} // pega do estado ou valor original
                        onChange={(e) =>
                          setUrlEditMenus({
                            ...urlEditMenus,
                            [menu.id]: e.target.value,
                          })
                        }
                      />

                      <Button
                        variant="success"
                        onClick={() => handleSaveEdit(menu)}
                        disabled={!menu.tempName.trim()}
                      >
                        Salvar
                      </Button>
                    </InputGroup>
                  ) : (
                    // MODO VISUALIZAÇÃO DO MENU PRINCIPAL
                    <>
                      <h6 className="mb-0"> {menu.name} </h6>
                      <div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleStartEdit(menu.id)}
                        >
                          Editar Categoria
                        </Button>
                        <Button
                          className="ms-2"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteMenu(menu.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Submenus Listados */}
                {menu.submenus.length > 0 && (
                  <div className="mb-2 ms-3">
                    <small className="text-muted">Subcategorias:</small>
                    <ul className="list-unstyled">
                      {menu.submenus.map((submenu, subIndex) => (
                        <li
                          key={submenu.id_submenu || subIndex}
                          className="d-flex justify-content-between align-items-center py-1"
                        >
                          {/* RENDERIZAÇÃO CONDICIONAL DO SUBMENU */}
                          {editingSubitem.menuId === menu.id &&
                          editingSubitem.oldName === submenu.label ? (
                            // MODO EDIÇÃO DO SUBMENU
                            <InputGroup size="sm">
                              <Form.Control
                                type="text"
                                value={editingSubitem.tempName}
                                onChange={(e) =>
                                  setEditingSubitem({
                                    ...editingSubitem,
                                    tempName: e.target.value,
                                  })
                                }
                              />
                              <Form.Control
                                type="text"
                                placeholder="Adicione Link de navegação"
                                value={editingSubitem.tempUrl}
                                onChange={(e) =>
                                  setEditingSubitem({
                                    ...editingSubitem,
                                    tempUrl: e.target.value,
                                  })
                                }
                              />

                              <Button
                                variant="success"
                                onClick={() =>
                                  handleSaveSubitemEdit(menu, submenu)
                                }
                                disabled={!editingSubitem.tempName.trim()}
                              >
                                Ok
                              </Button>

                              <Button
                                variant="outline-danger"
                                onClick={handleCancelSubitemEdit}
                              >
                                X
                              </Button>
                            </InputGroup>
                          ) : (
                            // MODO VISUALIZAÇÃO DO SUBMENU
                            <div className="d-flex align-items-center w-100">
                              <span className="flex-grow-1">
                                {submenu.label}
                              </span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  handleStartSubitemEdit(
                                    menu.id,
                                    submenu.label,
                                    submenu
                                  )
                                }
                                className="ms-3"
                              >
                                <MdModeEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveSubitem(
                                    menu.id,
                                    submenu.id_submenu
                                  )
                                }
                                className="ms-2"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Formulário para Adicionar NOVO Submenu a este item */}
                <div className="mt-2 pt-2 border-top">
                  <Form.Label className="mt-2 small">
                    Adicionar Subcategoria para **{menu.name}**
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Ex: Tênis"
                      value={newSubitemName[menu.id] || ""}
                      onChange={(e) =>
                        setNewSubitemName({
                          ...newSubitemName,
                          [menu.id]: e.target.value,
                        })
                      }
                    />
                    <Button
                      variant="secondary"
                      onClick={(e) => handleAddSubitem(menu, e)}
                      disabled={
                        !newSubitemName[menu.id] ||
                        !newSubitemName[menu.id].trim()
                      }
                    >
                      Adicionar
                    </Button>
                  </InputGroup>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    </Container>
  );
};

export default FormMenus;
