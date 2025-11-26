import axios from "axios";
import Urlmaster from "./urlMaster";

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
      console.error("Erro ao buscar menus da navbar:", error);
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
      console.error("Erro ao Cadastrar menus da navbar:", error);
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
      console.error("Erro ao Cadastrar menus da navbar:", error);
      throw new Error("Falha ao carregar menus da navbar");
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
      console.error("Erro ao deletar menus da navbar:", error);
      throw new Error("Falha ao deletar menus da navbar");
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
      console.error("Erro ao deletar menus da navbar:", error);
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
      console.error("Erro ao Cadastrar menus da navbar:", error);
    }
  };
}
