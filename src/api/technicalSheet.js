import axios from "axios";
import Product from "./product";
import Urlmaster from "./urlMaster";

export default class TechnicalSheet extends Urlmaster {
  constructor() {
    super();
  }

  registerTechnicalSheet = async (productLocalStorage, dataSheet, token) => {
    try {
      const productOnly = new Product();
      const findProductBefore = await productOnly.findOnlyProduct(
        productLocalStorage?.Product_Code,
        token
      );

      const productReq = {
        Product_ID: findProductBefore.showAllProducts[0].Product_ID,
        Product_Code: findProductBefore.showAllProducts[0].Product_Code,
        Product_Name: findProductBefore.showAllProducts[0].Product_Name,
        stock: findProductBefore.showAllProducts[0].stock.Quantity,
        details: {
          sub_category: parseInt(
            findProductBefore.showAllProducts[0].id_sub_category
          ),
          technical_sheet: {
            Barcode: dataSheet.Barcode,
            Battery_Life: dataSheet.Battery_Life,
            Connectivity: dataSheet.Connectivity,
            Depth: parseFloat(dataSheet.Depth),
            Door_Thickness: parseFloat(dataSheet.Door_Thickness),
            Finish: dataSheet.Finish,
            Height: parseFloat(dataSheet.Height),
            Humidity: dataSheet.Humidity,
            Id_brand: parseInt(dataSheet.Id_brand),
            Internal_Code: dataSheet.Internal_Code,
            Locking_Time: dataSheet.Locking_Time,
            Material: dataSheet.Material,
            Model: dataSheet.Model,
            Operating_Temperature: dataSheet.Operating_Temperature,
            Power_Supply: dataSheet.Power_Supply,
            Reference: dataSheet.Reference,
            Update_Info: dataSheet.Update_Info,
            User_Capacity: dataSheet.User_Capacity,
            Weight: parseFloat(dataSheet.Weight),
            Width: parseFloat(dataSheet.Width),
          },
          main_features: [],
          included_items: [],
        },
      };

      const response = await axios.put(
        `${this.getUrlMaster().urlApi}product`,
        productReq,
        token
      );
      console.log({ productReq, response });

      return { productReq };
    } catch (error) {
      console.error("Erro :", error);
      throw new Error("Falha", error);
    }
  };
  registerMainFactureTechnicalSheet = async (reqMainFacture, token) => {
    try {
      const productOnly = new Product();
      const productLocal = JSON.parse(
        localStorage.getItem("technicalDataSubmit")
      );
      const findProductBefore = await productOnly.findOnlyProduct(
        productLocal?.Product_Code,
        token
      );

      const mainFactureReq = {
        Technical_Sheet_ID:
          findProductBefore.showAllProducts[0].technical_sheet
            .Technical_Sheet_ID,
        Label: reqMainFacture.Label,
        Value: reqMainFacture.Value,
      };

      const response = await axios.put(
        `${this.getUrlMaster().urlApi}main-factures`,
        mainFactureReq,
        token
      );
      console.log(response);

      return { mainFactureReq, response };
    } catch (error) {
      console.error("Erro ao Marca menus da navbar:", error);
      throw new Error("Falha ao carregar Marca");
    }
  };
  registerItemIncludedTechnicalSheet = async (reqItenIncluded, token) => {
    const productOnly = new Product();
    const productLocal = JSON.parse(
      localStorage.getItem("technicalDataSubmit")
    );

    const findProductBefore = await productOnly.findOnlyProduct(
      productLocal?.Product_Code,
      token
    );

    const productReq = {
      Technical_Sheet_ID:
        findProductBefore.showAllProducts[0].technical_sheet.Technical_Sheet_ID,
      Item: reqItenIncluded.Item,
    };

    console.log(productReq);
    try {
      const response = await axios.put(
        `${this.getUrlMaster().urlApi}included-items`,
        productReq,
        token
      );

      return { productReq, response };
    } catch (error) {
      console.error("Erro ao Marca menus da navbar:", error);
      throw new Error("Falha ao carregar Marca");
    }
  };
}
