import React from "react";
import HollowPage from "../HollowPage";
import ClientList from "./ClientList";

const Client = ({ submenu, token }) => {
  return (
    <HollowPage>
      {submenu === "Listar Clientes" && <ClientList token={token} />}
    </HollowPage>
  );
};

export default Client;
