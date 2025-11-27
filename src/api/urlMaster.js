export default class Urlmaster {
  getUrlMaster() {
    const urlApi = "/api/";
    const urlSite = "/auth/";
    /* 
    const urlApi = "http://localhost:3000/api/";
    const urlSite = "http://localhost:3000/";
     */
    return { urlApi, urlSite };
  }
}
