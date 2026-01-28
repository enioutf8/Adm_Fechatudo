import React, { useEffect, useState } from "react";
import EnviromentEditor from "../../api/enviromentEditorLayout";

const EnviromentEditorLayout = ({ token }) => {
  const enviromentEditorLayout = new EnviromentEditor();
  const [environmentGet, setEnvironmentGet] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await enviromentEditorLayout.findAllBanners(token);
      setEnvironmentGet(data || []);
    };

    load();
  }, [token]);

  const handleUpload = async (file, item) => {
    if (!file) return;

    setLoading(item.id_layout_environment);

    const formData = new FormData();
    formData.append("icon", file);
    formData.append("id_layout_environment", item.id_layout_environment);

    try {
      const response = await enviromentEditorLayout.uploadEnvironmentImage(
        token,
        formData,
      );

      setEnvironmentGet((prev) =>
        prev.map((env) =>
          env.id_layout_environment === item.id_layout_environment
            ? {
                ...env,
                url_img: `${response.url}?v=${Date.now()}`,
              }
            : env,
        ),
      );
    } catch {
      alert("Erro ao atualizar imagem");
    } finally {
      setLoading(null);
    }
  };

  const removeCacheBuster = (url) => {
    if (!url) return "";
    return url.split("?")[0];
  };

  return (
    <div className="container mt-4">
      <h4>Ambientes</h4>
      <small className="text-danger"><i>Obs: As imagens precisam ter até 500kb de tamanho</i></small>
       
      <div className="row">
        {environmentGet.map((item, index) => (
          <div
            className="col-md-6 col-lg-4 mb-4"
            key={item.id_layout_environment}
          >
            <div className="card shadow-sm h-100">
              <img
                src={`https://fechatudo.com.br/${item.url_img}`}
                alt={item.label}
                className="card-img-top"
                style={{ height: 200, objectFit: "cover" }}
              />

              <div className="card-body">
                {/* TÍTULO */}
                <div className="mb-2">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.label}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEnvironmentGet((prev) =>
                        prev.map((env, i) =>
                          i === index ? { ...env, label: value } : env,
                        ),
                      );
                    }}
                  />
                </div>

                {/* LINK */}
                <div className="mb-2">
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.url_direction}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEnvironmentGet((prev) =>
                        prev.map((env, i) =>
                          i === index ? { ...env, url_direction: value } : env,
                        ),
                      );
                    }}
                  />
                </div>

                {/* BOTÕES */}
                <div className="d-flex gap-2">
                  <label className="btn btn-outline-secondary btn-sm w-50">
                    {loading === item.id_layout_environment
                      ? "Enviando..."
                      : "Trocar imagem"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files[0], item)}
                    />
                  </label>

                  <button
                    className="btn btn-warning btn-sm w-50"
                    onClick={async () => {
                      try {
                        setLoading(item.id_layout_environment);

                        await enviromentEditorLayout.updateEnvironmentData(
                          token,
                          {
                            id_layout_environment: item.id_layout_environment,
                            label: item.label,
                            url_direction: item.url_direction,
                            target_blank: item.target_blank,
                            // 👇 mantém a imagem existente
                            url_img: removeCacheBuster(item.url_img),
                          },
                        );

                        alert("Dados atualizados com sucesso");
                      } catch {
                        alert("Erro ao salvar alterações");
                      } finally {
                        setLoading(null);
                      }
                    }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnviromentEditorLayout;
