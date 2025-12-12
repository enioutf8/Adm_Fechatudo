import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class Bannerhome extends Urlmaster {
  constructor() {
    super();
  }

  findBannersHome = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}banner-home`,
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
  deleteBannerHome = async (data, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}banner-home`,
        {
          data,
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
  uploadBannerHome = async (formData, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}banner-home`,
        formData, // aqui usamos o formData recebido por parâmetro
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Banner enviado com sucesso:", response.data);
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
  editBannerHome = async (data, token) => {
    console.log(data);
    try {
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}banner-home`,
        data
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
  // MOBILE
  uploadBannerHomemMobile = async (formData, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}banner-home-mobile`,
        formData, // aqui usamos o formData recebido por parâmetro
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Banner enviado com sucesso:", response.data);
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
  deleteBannerHomeMobile = async (data, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}banner-home-mobile`,
        {
          data,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao deletar menus da navbar:", error);
      throw new Error("Falha ao deletar menus da navbar");
    }
  };
  editBannerHomeMobile = async (data, token) => {
    try {
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}banner-home-mobile`,
        data
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
