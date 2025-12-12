import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class Instalation extends Urlmaster {
  constructor() {
    super();
  }
  findAllInstallation = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}installation`,
        token
      );
      const result = await response.data;
      return result;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

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
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

  editInstallation = async (data, token) => {
    try {
      console.log({ token, data });
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}installation/${data.Installation_ID}`,
        data,
        token
      );
      const result = await response;
      return result;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

  deleteInstallation = async (id, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}installation/${id}`,
        token
      );
      const result = await response;
      return result;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

  //Installation and Product

  createInstallationAndProduct = async (data, token) => {
    try {
      console.log({ token, data });
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}product-installation`,
        data,
        token
      );
      const result = await response;
      return result;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };

  deleteInstallationAndProduct = async (data, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}product-installation`,
        {
          data: data, // ⚠️ aqui dentro do config
        }
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 401 && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        alert("Sua sessão expirou. Você será redirecionado.");

        window.location.href = "/";
      }

      return { success: false, error: "Falha ao enviar instalação" };
    }
  };
}
