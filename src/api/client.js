import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Clients extends Urlmaster {
  constructor() {
    super();
  }

  findAllClients = async (token) => {
    try {
      const response = await axios.get(
        `http://191.252.103.153:3000/cliente/client`,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };
}
