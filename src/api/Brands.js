import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class Brands extends Urlmaster {
  constructor() {
    super();
  }

  findAllBrands = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}brands`,
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

  createBrand = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}brands`,
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
  deleteBrand = async (id, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}brands/${id}`,
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
