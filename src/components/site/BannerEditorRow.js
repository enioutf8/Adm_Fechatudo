import React, { useEffect, useState, useRef } from "react";
import "./BannerEditorRow.css";
import { FaTrashAlt } from "react-icons/fa";
import Bannerhome from "../../api/bannerHome"; // Certifique-se de que os caminhos estão corretos
import Urlmaster from "../../api/urlMaster"; // Certifique-se de que os caminhos estão corretos
import { MdModeEdit } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import {
  Form,
  Button,
  Container,
  ListGroup,
  InputGroup,
} from "react-bootstrap";

const BannerEditorRow = ({ token }) => {
  const [allBannerHome, setAllBannerHome] = useState([]);
  const bannerHome = new Bannerhome(); // Assumindo que o construtor aceita um valor inicial
  const urlimgs = new Urlmaster();
  const [timedBannerHome, setTimedBannerHome] = useState(Date.now());
  const [logoFile, setLogoFile] = useState(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerURL, setBannerURL] = useState("");
  const [editBannerTitle, setEditBannerTitle] = useState("");
  const [editBannerURL, setEditBannerURL] = useState("");
  // Ref para o input de arquivo (um para cada banner)
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerHome.findBannersHome(token);
        // Adiciona um campo temporário `localImageUrl` para cada banner
        // Isso permitirá pré-visualizar uploads locais antes de salvar
        const bannersWithLocalImages = response.map((b) => ({
          ...b,
          localImageUrl: `${urlimgs.getUrlMaster().urlSite}${b.archive}`, // Imagem inicial
        }));
        setAllBannerHome(bannersWithLocalImages);
      } catch (error) {
        console.error("Erro ao carregar banners:", error);
      }
    };

    fetchBanners();
  }, [timedBannerHome]);

  const handleSaveBanner = async (bannerId) => {
    const dataUpdate = {
      id_archives: bannerId,
      alt: editBannerTitle,
      url: editBannerURL,
    };

    await bannerHome.editBannerHome(dataUpdate);
    setTimedBannerHome(Date.now());
  };

  const handleDeleteBanner = async (bannerId) => {
    const idDelete = { id_archives: bannerId };
    await bannerHome.deleteBannerHome(idDelete);
    setTimedBannerHome(Date.now());
  };

  const handleBannerUpload = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cria o objeto FormData para enviar dados multipart/form-data
    const formData = new FormData();
    formData.append("banner-home", logoFile); // nome do campo igual ao da imagem
    formData.append("url", bannerURL);
    formData.append("alt", bannerTitle);

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    await bannerHome.uploadBannerHome(formData, token);
    setTimedBannerHome(Date.now());
  };

  if (allBannerHome.length === 0) {
    return (
      <div className="areaTotalBanner">
        <p>Nenhum banner encontrado ou carregando...</p>
      </div>
    );
  }

  return (
    <Container>
      <div className="  d-flex flex-column flex-lg-row  ">
        {/* 1. Área de Cadastro (Esquerda em Desktop) */}
        <div
          style={{ height: "max-content" }}
          className="flex-grow-2   mb-4  p-3 border rounded bg-light "
        >
          <h5>Adicionar novo Banner</h5>
          <hr />
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFile" className="mb-4">
              <Form.Label>
                <FaImage /> Carregar <strong>Banner</strong>
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="Título do banner (alt)"
                className="mb-2"
                value={bannerTitle ?? ""} // garante string mesmo se undefined
                onChange={(e) => setBannerTitle(e.target.value)}
              />

              <Form.Control
                type="text"
                placeholder="URL do banner"
                className="mb-2"
                value={bannerURL ?? ""} // idem
                onChange={(e) => setBannerURL(e.target.value)}
              />

              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
              />

              {logoFile && (
                <div className="mt-2 p-2 border rounded">
                  <p className="mb-1">{logoFile.name}</p>
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Banner Preview"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </div>
              )}
            </Form.Group>

            <Button
              variant="warning"
              type="submit"
              className="w-100 mt-3 btn-lg"
            >
              Cadastrar Banner
            </Button>
          </Form>
        </div>

        {/* 2. Área de Edição/Itens Existentes (Direita em Desktop) */}
        <div className=" flex-grow-1  ">
          <div className="areaTotalBanner">
            <ul className="areaBanners">
              {allBannerHome.map((banner) => (
                <li key={banner.id_archives} className="area-content">
                  {/* Div da Imagem Clicável */}
                  <div
                    className="imgBannerThumbnail"
                    style={{ cursor: "pointer", position: "relative" }} // Adiciona cursor para indicar clicável
                  >
                    <img
                      src={
                        banner.localImageUrl ||
                        `${urlimgs.getUrlMaster().urlSite}${banner.archive}`
                      }
                      alt={banner.alt || "Banner"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400x200?text=IMAGEM+NAO+ENCONTRADA";
                      }} // Fallback
                    />
                    {/* Input de arquivo oculto */}
                  </div>

                  <div className="contentBanner">
                    <div className="contentListBanner-title">
                      <input
                        defaultValue={banner.alt}
                        className="form-control"
                        placeholder="Titulo da imagem"
                        onChange={(e) => setEditBannerTitle(e.target.value)}
                      />
                    </div>
                    <div className="contentListBanner-link">
                      <input
                        className="form-control"
                        defaultValue={banner.url}
                        placeholder="Link da imagem"
                        onChange={(e) => setEditBannerURL(e.target.value)}
                      />
                    </div>
                    <div className="contentListBanner-actions">
                      {" "}
                      {/* Renomeado para clareza */}
                      <button
                        style={{ marginRight: "5px" }}
                        className="btn btn-secondary"
                        onClick={() => handleSaveBanner(banner.id_archives)} // Botão para salvar
                      >
                        <MdModeEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteBanner(banner.id_archives)} // Botão para deletar
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BannerEditorRow;
