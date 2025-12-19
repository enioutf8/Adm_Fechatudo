import axios from "axios";
import Urlmaster from "./urlMaster";
let sessionExpiredHandled = false;
export default class MenusNavBar extends Urlmaster {
  constructor() {
    super();
  }

  findMenusNavbar = async (token) => {
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}all-navbar`,
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

  registerMenusNavbar = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}find-menu-navbar`,
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

  editMenusNavbar = async (data, token) => {
    try {
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}menu-navbar`,
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

  deleteMenusNavbar = async (data, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}menu-navbar`,
        {
          data,
          token,
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

  deleteSubMenusNavbar = async (data, token) => {
    try {
      const response = await axios.delete(
        `${this.getUrlMaster().urlApi}submenus-navbar`,
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

  registerSubMenusNavbar = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}find-menu-navbar`,
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
