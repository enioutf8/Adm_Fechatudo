import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Orders extends Urlmaster {
  constructor() {
    super();
  }

  findOrdersPendent = async (token) => {
    console.log(token);
    try {
      const response = await axios.get(
        `http://191.252.103.153:3000/cliente/orders-pendent-adm`,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };
  findOrdersFinished = async (token) => {
    console.log(token);
    try {
      const response = await axios.get(
        `http://191.252.103.153:3000/cliente/orders-finished-adm`,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };
  updateOrders = async (data, token) => {
    console.log(token);
    try {
      const response = await axios.put(
        `http://191.252.103.153:3000/cliente/orders/${data.id_order}`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };
}
