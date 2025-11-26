import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Brands extends Urlmaster {
  constructor() {
    super();
  }

  findAllBrands = async (token) => {
    console.log(token);
    try {
      const response = await axios.get(
        `${this.getUrlMaster().urlApi}brands`,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao Marca menus da navbar:", error);
    }
  };

  createBrand = async (data, token) => {
    console.log(token);
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}brands`,
        data,
        token
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao Marca menus da navbar:", error);
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
      console.error("Erro ao Marca menus da navbar:", error);
    }
  };
}
