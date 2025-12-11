import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Instalation extends Urlmaster {
  constructor() {
    super();
  }

  createInstallation = async (data, token) => {
    try {
      console.log({ token, data });
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}installation`,
        data,
        token
      );
      const result = await response;
      return result;
    } catch (error) {
      console.error("Erro ao enviar instalação:", error);
      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

  findAllInstallation = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}installation`,
        token
      );
      const result = await response.data;
      return result;
    } catch (error) {
      console.error("Erro ao enviar instalação:", error);
      return { success: false, error: "Falha ao enviar instalação" };
    }
  };
}
