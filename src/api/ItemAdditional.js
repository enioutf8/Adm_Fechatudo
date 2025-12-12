import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class ItemAdditional extends Urlmaster {
  constructor() {
    super();
  }

  registerItemAdditional = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}item-additional`,
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
