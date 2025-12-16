import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Product extends Urlmaster {
  constructor() {
    super();
  }

  registerNewProduct = async (data, token) => {
    try {
      //console.log(data);
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}product`,
        data,
        token
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);

      throw new Error("Falha ao carregar menus da navbar");
    }
  };

  editProduct = async (data, token) => {
    try {
      console.log(data);
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}product`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao Editar Produto:", error);
    }
  };

  findOnlyProduct = async (string, token) => {
    console.log(string);
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}product-only-adm/${string}`,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);

      throw new Error("Falha ao carregar menus da navbar");
    }
  };

  addImgsProduct = async (Product_ID, Product_Code, name, fotos, token) => {
    try {
      const response = await axios.post(
        `${
          this.getUrlMaster().urlApi
        }product-foto?Product_ID=${Product_ID}&Product_Code=${Product_Code}&name=${name}`,
        fotos,
        token
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);
    }
  };

  registerProductColor = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}color-product`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);

      throw new Error("Falha ao carregar menus da navbar");
    }
  };

  registerProductEnvironment = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}environment-product`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar menus da navbar:", error);

      throw new Error("Falha ao carregar menus da navbar");
    }
  };
}
