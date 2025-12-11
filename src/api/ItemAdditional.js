import axios from "axios";
import Urlmaster from "./urlMaster";
export default class ItemAdditional extends Urlmaster {
  constructor() {
    super();
  }

  registerItemAdditional = async (data, token) => {
    try {
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}item-additional`,
        data,
        token
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
}
