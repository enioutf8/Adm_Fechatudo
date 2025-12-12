import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
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
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;
        alert("Sua sessão expirou. Você será redirecionado.");
        window.location.href = "/";
      }
      return null;
    }
  };

  findOrdersFinished = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlSite}cliente/orders-finished-adm`,
        token
      );

      return response.data;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return null;
    }
  };
  updateOrders = async (data, token) => {
    try {
      const response = await axios.put(
        `${this.getUrlMaster().urlSite}cliente/orders/${data.id_order}`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return null;
    }
  };
}
