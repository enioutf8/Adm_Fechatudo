import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Orders extends Urlmaster {
  constructor() {
    super();
  }

  findOrdersPendent = async (token) => {
  
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlSite}cliente/orders-pendent-adm`,
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
        `${this.getUrlMaster().urlSite}cliente/orders-finished-adm`,
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
        `${this.getUrlMaster().urlSite}cliente/orders/${data.id_order}`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };
}
