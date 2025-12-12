import axios from "axios";
import Urlmaster from "./urlMaster";

export default class ProductBanner extends Urlmaster {
  constructor() {
    super();
  }

  createBannerProduct = async (formData) => {
    try {
      return await axios.post(
        `${this.getUrlMaster().urlApi}upload-product-banner`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } catch (error) {
      console.error("Erro ao enviar banner:", error);
      throw error; // <-- OBRIGATÓRIO
    }
  };

  deleteBannerProduct = async (id) => {
    try {
      return await axios.delete(
        `${this.getUrlMaster().urlApi}product-banner/${id}`
      );
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      throw error; // <-- OBRIGATÓRIO
    }
  };
}
