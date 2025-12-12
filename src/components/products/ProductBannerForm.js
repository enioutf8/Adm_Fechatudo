import { useState, useEffect } from "react";
import ProductBanner from "../../api/productBanner";

export default function ProductBannerForm({ productId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState({});
  const [timed, setTimed] = useState(Date.now());
  const url = "http://localhost:3000";

  const api = new ProductBanner();

  useEffect(() => {
    const prod = JSON.parse(localStorage.getItem("productSubmit"));
    setProduct(prod);
    // limpa apenas o preview
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []); // <--- Apenas no primeiro render

  // 🔹 Carrega produto do localStorage
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 🔹 Controla arquivo
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(selected));
  };

  // 🔹 Upload
  const handleUpload = async () => {
    if (!file) return setMessage("Selecione um arquivo antes de enviar.");
    if (!productId) return setMessage("Product_ID não fornecido.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("Product_ID", String(productId));

    setLoading(true);
    setMessage("");

    try {
      const response = await api.createBannerProduct(formData);

      setMessage(response.data?.message || "Upload realizado com sucesso!");

      // Limpa upload
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);

      // Atualiza localStorage corretamente
      const prod = JSON.parse(localStorage.getItem("productSubmit"));

      // garante que existe product_banner
      const bannerList =
        prod?.data?.product_banner ?? prod?.product_banner ?? [];

      const updatedProduct = {
        ...prod,
        data: {
          ...prod.data,
          product_banner: [...bannerList, response.data.banner],
        },
      };

      localStorage.setItem("productSubmit", JSON.stringify(updatedProduct));
      setProduct(updatedProduct);

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Erro ao enviar o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete banner
  const handleDelete = async (bannerId) => {
    if (!window.confirm("Deseja realmente deletar este banner?")) return;

    try {
      const response = await api.deleteBannerProduct(bannerId);

      setMessage(response.data?.message || "Banner removido.");

      const prod = JSON.parse(localStorage.getItem("productSubmit"));

      const bannerList =
        prod?.data?.product_banner ?? prod?.product_banner ?? [];

      // Remove o banner
      const filtered = bannerList.filter(
        (b) => b.Id_Product_Banner !== bannerId
      );

      const updatedProduct = {
        ...prod,
        data: {
          ...prod.data,
          product_banner: filtered,
        },
      };

      // atualiza estados e storage
      localStorage.setItem("productSubmit", JSON.stringify(updatedProduct));
      setProduct(updatedProduct);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao deletar banner.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Upload de Banner</h3>

      {/* UPLOAD */}
      <div className="mb-3">
        <label className="form-label">Selecione o banner</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <div className="mb-3">
          <p>
            <strong>Preview:</strong>
          </p>
          <img
            src={preview}
            alt="preview"
            className="img-fluid rounded border"
            style={{ maxHeight: "200px" }}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar Banner"}
      </button>

      {message && <div className="alert alert-info mt-3">{message}</div>}
      <hr></hr>
      {/* LISTA DE BANNERS */}
      <div className="row g-3 mt-4">
        {product?.data?.product_banner?.map((banner) => (
          <div
            key={banner.Id_Product_Banner}
            className="col-auto position-relative"
            style={{ marginRight: "15px", width: "150px" }}
          >
            <img
              src={`${url}${banner.url}`}
              className="img-fluid rounded border"
              style={{ height: "100px", objectFit: "cover", width: "150px" }}
            />

            {/* Botão Delete */}
            <button
              onClick={() => handleDelete(banner.Id_Product_Banner)}
              className="btn btn-danger btn-sm position-absolute"
              style={{
                top: "-10px",
                right: "-10px",
                borderRadius: "50%",
                padding: "4px 7px",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
