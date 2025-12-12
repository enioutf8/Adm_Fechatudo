import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class Clients extends Urlmaster {
  constructor() {
    super();
  }

  findAllClients = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlSite}cliente/client`,
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
