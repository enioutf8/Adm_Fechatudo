import React, { useEffect, useState } from "react";
import TechnicalSheet from "../../api/technicalSheet";
import "bootstrap/dist/css/bootstrap.min.css";
import TechnicalSections from "./TechnicalSections";

const ProductTechnicalForm = ({ brands, productLocalStorage, token }) => {
  const [time, setTime] = useState(Date.now());
  const [mockBrands, setmockBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [barcode, setBarcode] = useState("");
  const [internalCode, setInternalCode] = useState("");
  const [reference, setReference] = useState("");
  const [material, setMaterial] = useState("");
  const [finish, setFinish] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [weight, setWeight] = useState("");
  const [doorThickness, setDoorThickness] = useState("");
  const [operatingTemp, setOperatingTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [energySource, setEnergySource] = useState("");
  const [batteryLife, setBatteryLife] = useState("");
  const [connectivity, setConnectivity] = useState("");
  const [userCapacity, setUserCapacity] = useState("");
  const [updateInfo, setUpdateInfo] = useState("");
  const [lockingTime, setLockingTime] = useState("");
  const [sheetIsLog, setSheetisLog] = useState(false);

  // 🔹 Carregar lista de marcas
  useEffect(() => {
    const extratorBrands = async () => {
      const responseBrands = await brands.findAllBrands(token);
      setmockBrands(responseBrands);
    };
    extratorBrands();
  }, [brands]);

  // 🔹 Envio da ficha técnica
  const handleSubmit = async () => {
    const technicalData = {
      Id_brand: brand,
      Model: model,
      Barcode: barcode,
      Internal_Code: internalCode,
      Reference: reference,
      Material: material,
      Finish: finish,
      Height: height,
      Width: width,
      Depth: depth,
      Weight: weight,
      Door_Thickness: doorThickness,
      Operating_Temperature: operatingTemp,
      Humidity: humidity,
      Power_Supply: energySource,
      Battery_Life: batteryLife,
      Connectivity: connectivity,
      User_Capacity: userCapacity,
      Update_Info: updateInfo,
      Locking_Time: lockingTime,
    };

    const technicalSheet = new TechnicalSheet();
    const stored = localStorage.getItem("productSubmit");
    const productLocalStorage = JSON.parse(stored);
    const response = await technicalSheet.registerTechnicalSheet(
      productLocalStorage.data,
      technicalData,
      token
    );

    await localStorage.setItem(
      "technicalDataSubmit",
      JSON.stringify(response?.productReq)
    );

    alert("✅ Ficha Técnica salva com sucesso!");
    setTime(Date.now());
  };

  // 🔹 Carregar dados salvos do localStorage (pré-preencher campos)
  useEffect(() => {
    const stored = localStorage.getItem("technicalDataSubmit");
    if (!stored) return;

    try {
      const sheet = JSON.parse(stored);
      const tech =
        sheet?.details?.technical_sheet || sheet?.technical_sheet || {};

      setSheetisLog(true);
      setBrand(tech?.Id_brand || "");
      setModel(tech?.Model || "");
      setBarcode(tech?.Barcode || "");
      setInternalCode(tech?.Internal_Code || "");
      setReference(tech?.Reference || "");
      setMaterial(tech?.Material || "");
      setFinish(tech?.Finish || "");
      setHeight(tech?.Height || "");
      setWidth(tech?.Width || "");
      setDepth(tech?.Depth || "");
      setWeight(tech?.Weight || "");
      setDoorThickness(tech?.Door_Thickness || "");
      setOperatingTemp(tech?.Operating_Temperature || "");
      setHumidity(tech?.Humidity || "");
      setEnergySource(tech?.Power_Supply || "");
      setBatteryLife(tech?.Battery_Life || "");
      setConnectivity(tech?.Connectivity || "");
      setUserCapacity(tech?.User_Capacity || "");
      setUpdateInfo(tech?.Update_Info || "");
      setLockingTime(tech?.Locking_Time || "");
    } catch (err) {
      console.error("Erro ao ler technicalDataSubmit:", err);
    }
  }, [time]);

  return (
    <>
      <div className="container mt-4">
        <form className="border rounded-3 shadow-sm p-4 bg-white">
          <h4 className="text-center mb-4 fw-bold">
            2. Ficha Técnica Completa
          </h4>

          <h5 className="fw-semibold mb-3">Identificação e Classificação</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Marca *</label>
              <select
                className="form-control"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Selecione...</option>
                {mockBrands.map((b) => (
                  <option key={b.Id_brand} value={b.Id_brand}>
                    {b.brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Modelo *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o modelo"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Código de Barras *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o código de barras"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Código Interno</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o código interno"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Referência *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite a referência"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Material *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Acabamento *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o acabamento"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
              />
            </div>
          </div>

          <hr className="my-4" />

          <h5 className="fw-semibold mb-3">Dimensões e Peso</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Altura (cm) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ex: 100"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Largura (cm) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ex: 50"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Profundidade (cm) *
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Ex: 40"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Peso (kg) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Ex: 5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Espessura da Porta
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Ex: 2.5"
                value={doorThickness}
                onChange={(e) => setDoorThickness(e.target.value)}
              />
            </div>
          </div>

          <hr className="my-4" />

          <h5 className="fw-semibold mb-3">Especificações Operacionais</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Temperatura de Operação
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 0°C a 40°C"
                value={operatingTemp}
                onChange={(e) => setOperatingTemp(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Umidade</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Até 90%"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Fonte de Energia</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Bivolt"
                value={energySource}
                onChange={(e) => setEnergySource(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Vida Útil da Bateria
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 8h"
                value={batteryLife}
                onChange={(e) => setBatteryLife(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Conectividade</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Wi-Fi, Bluetooth"
                value={connectivity}
                onChange={(e) => setConnectivity(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Capacidade de Usuários
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 5 usuários"
                value={userCapacity}
                onChange={(e) => setUserCapacity(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Info. de Atualização
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Atualização via OTA"
                value={updateInfo}
                onChange={(e) => setUpdateInfo(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Tempo de Travamento
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 5s"
                value={lockingTime}
                onChange={(e) => setLockingTime(e.target.value)}
              />
            </div>
          </div>

          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-warning fw-semibold px-4"
              onClick={handleSubmit}
            >
              Salvar Ficha Técnica
            </button>
          </div>
        </form>
      </div>

      {sheetIsLog && <TechnicalSections token={token} />}
    </>
  );
};

export default ProductTechnicalForm;
