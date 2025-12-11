import axios from "axios";
import Urlmaster from "./urlMaster";

export default class Category extends Urlmaster {
  constructor() {
    super();
  }

  // -----------------------------
  // CATEGORY
  // -----------------------------

  findAllCategory = async (token) =>
    axios.get(`${this.getUrlMaster().urlApi}category-adm`, token);

  findCategoryById = async (id, token) =>
    axios.get(`${this.getUrlMaster().urlApi}category-adm-by-id/${id}`, token);

  create = async (data, token) =>
    axios.post(`${this.getUrlMaster().urlApi}category-adm/`, data, token);

  update = async (id, data, token) =>
    axios.put(`${this.getUrlMaster().urlApi}category-adm/${id}`, data, token);

  delete = async (id, token) =>
    axios.delete(`${this.getUrlMaster().urlApi}category-adm/${id}`, token);

  // -----------------------------
  // SUBCATEGORY
  // -----------------------------

  findAllSubCategory = async (token) =>
    axios.get(`${this.getUrlMaster().urlApi}sub-category-adm`, token);

  findSubCategoryById = async (id, token) =>
    axios.get(
      `${this.getUrlMaster().urlApi}sub-category-adm/by-id/${id}`,
      token
    );

  findSubCategoryByCategory = async (id_category, token) =>
    axios.get(
      `${
        this.getUrlMaster().urlApi
      }sub-category-adm/by-category/${id_category}`,
      token
    );

  createSubCategory = async (data, token) =>
    axios.post(`${this.getUrlMaster().urlApi}sub-category-adm`, data, token);

  updateSubCategory = async (id, data, token) =>
    axios.put(
      `${this.getUrlMaster().urlApi}sub-category-adm/${id}`,
      data,
      token
    );

  updateSubCategoryLayout = async (data) =>
    axios.put(`${this.getUrlMaster().urlApi}layout-subcategory`, data);

  updateSubCategoryIMG = async (formData, token) =>
    axios.post(
      `${this.getUrlMaster().urlApi}layout-subcategory-file`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
      token
    );

  deleteSubCategory = async (id, token) =>
    axios.delete(`${this.getUrlMaster().urlApi}sub-category-adm/${id}`, token);

  deleteSubCategoryLayout = async (id, token) =>
    axios.delete(
      `${this.getUrlMaster().urlApi}layout-subcategory/${id}`,
      token
    );
}
