import axios from "axios";
import Urlmaster from "./urlMaster";

export default class LoginCompany extends Urlmaster {
  constructor() {
    super();
  }

  login = async (data) => {
    try {
      console.log(data);
      const response = await axios.post(
        `${this.getUrlMaster().urlApi}company-authenticate`,
        data
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);

      throw new Error(error);
    }
  };
}
