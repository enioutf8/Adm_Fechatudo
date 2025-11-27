import React, { useContext, useState, useEffect } from "react";
import MenuLeft from "../components/MenuLeft";
import "./Dashboard.css";
import RegisterProduct from "../components/products/RegisterProduct";
import { GlobalContext } from "../context/GlobalContext";
import MenuLeftMobile from "../components/componentesMobile/MenuLeftMobile";
import LayoutSite from "../components/site/LayoutSite";
import Order from "../components/Orders/Order";
import Client from "../components/Clients/Client";

const Dashboard = () => {
  const { isDesktop, currentMenuSelected } = useContext(GlobalContext);

  const [token] = useState(localStorage.getItem("tokenCompany"));
  let axiosConfig = { headers: { Authorization: "Bearer " + token } };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  const handleLogout = () => {
    const confirmed = window.confirm("Tem certeza que deseja sair?");

    if (confirmed) {
      localStorage.removeItem("company");
      localStorage.removeItem("tokenCompany");
      window.location.href = "/";
    }
  };

  if (!token) return null;

  return (
    <div className="dashboard">
      {isDesktop ? <MenuLeft /> : <MenuLeftMobile />}

      <div className="area-body">
        {currentMenuSelected.item === "Layout do Site" && (
          <LayoutSite
            token={axiosConfig}
            submenu={currentMenuSelected.subItem}
          />
        )}
        {currentMenuSelected.item === "Produtos" && (
          <RegisterProduct
            token={axiosConfig}
            submenu={currentMenuSelected.subItem}
          />
        )}
        {currentMenuSelected.item === "Pedidos" && (
          <Order token={axiosConfig} submenu={currentMenuSelected.subItem} />
        )}
        {currentMenuSelected.item === "Clientes" && (
          <Client token={axiosConfig} submenu={currentMenuSelected.subItem} />
        )}

        {currentMenuSelected.item === "Sair" && handleLogout()}
      </div>
    </div>
  );
};

export default Dashboard;
