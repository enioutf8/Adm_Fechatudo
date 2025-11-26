import React from "react";
import HollowPage from "../HollowPage";
import OrderList from "./OrderList";
import OrderFinished from "./OrderFinished";

const Order = ({ submenu, token }) => {
  return (
    <HollowPage>
      {submenu === "Pedidos em Aberto" && <OrderList token={token} />}
      {submenu === "Pedidos Concluídos" && <OrderFinished token={token} />}
    </HollowPage>
  );
};

export default Order;
