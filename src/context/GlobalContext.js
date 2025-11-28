import React, { createContext, useState, useEffect } from "react";
import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaLayerGroup,
  FaSignOutAlt,
} from "react-icons/fa";
export const GlobalContext = createContext({
  currentMenuSelected: { item: "", subItem: "" },
  setCurrentMenuSelected: () => {},
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

export const GlobalContextProvider = ({ children }) => {
  const [currentMenuSelected, setCurrentMenuSelected] = useState({
    item: "Pedidos",
    subItem: "Pedidos em Aberto",
  });
  const [timed, setTimed] = useState(Date.now());
  const [productEdit, setProductEdit] = useState(false);
  const MenuPrincipal = [
    {
      id: 3,
      label: "Pedidos",
      link: "/admin/pedidos",
      icon: <FaShoppingCart />,
      submenus: [
        { id: 31, label: "Pedidos em Aberto", link: "/admin/pedidos/abertos" },
        {
          id: 32,
          label: "Pedidos Concluídos",
          link: "/admin/pedidos/concluidos",
        },
      ],
    },
    {
      id: 4,
      label: "Clientes",
      link: "/admin/clientes",
      icon: <FaUsers />,
      submenus: [
        { id: 41, label: "Listar Clientes", link: "/admin/clientes/listar" },
      ],
    },
    {
      id: 2,
      label: "Produtos",
      link: "/admin/produtos",
      icon: <FaBoxOpen />,
      submenus: [
        { id: 21, label: "Cadastrar Produto", link: "/admin/produtos/novo" },
        {
          id: 22,
          label: "Listar / Editar Produtos",
          link: "/admin/produtos/listar",
        },
        { id: 23, label: "Categorias", link: "/admin/produtos/categorias" },
        { id: 24, label: "Marcas", link: "/admin/produtos/marca" },
      ],
    },

    {
      id: 5,
      label: "Layout do Site",
      link: "/admin/layout",
      icon: <FaLayerGroup />,
      submenus: [
        { id: 52, label: "Menu e Navegação", link: "/admin/layout/menu" },
        {
          id: 51,
          label: "Banners",
          link: "/admin/layout/banners",
        },
        {
          id: 53,
          label: "Subcategorias Navegação",
          link: "/admin/layout/navegation",
        },

        {
          id: 54,
          label: "Institucional",
          link: "/admin/layout/institutional",
        },
        {
          id: 55,
          label: "Rodapé",
          link: "/admin/layout/footer",
        },
      ],
    },

    { id: 8, label: "Sair", link: "/logout", icon: <FaSignOutAlt /> },
  ];

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      setIsDesktop(width > 1024);
    };

    handleResize(); // executa na primeira renderização
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        currentMenuSelected,
        setCurrentMenuSelected,
        isMobile,
        isTablet,
        isDesktop,
        MenuPrincipal,
        timed,
        setTimed,
        productEdit,
        setProductEdit,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
