import axios from "axios";
import Urlmaster from "./urlMaster";

let sessionExpiredHandled = false;

export default class EnviromentEditor extends Urlmaster {
  constructor() {
    super();
  }

  findAllBanners = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlSite}environment/adm`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  uploadEnvironmentImage = async (token, formData) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}upload-environment-adm-layout`,
        formData,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem", error);
      throw error;
    }
  };

  updateEnvironmentData = async (token, payload) => {
  try {
    const response = await axios.put(
      `${this.getUrlMaster().urlApi}environment-adm-layout`,
      payload,
      token
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar ambiente", error);
    throw error;
  }
};

}
