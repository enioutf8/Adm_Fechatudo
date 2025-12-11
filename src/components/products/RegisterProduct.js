import HollowPage from "../HollowPage";
import ProductList from "../ProductList";
import CategoryManager from "../site/CategoryManager";
import ProductForm from "../site/ProductForm";
import BrandForm from "./BrandForm";
import "./RegisterProduct.css";
import PageInstalation from "../InstalationEditor/PageInstalation";
import InstallationEditor from "../site/InstallationEditor";
const RegisterProduct = ({ submenu, token }) => {
  return (
    <>
      <HollowPage>
        {submenu === "Cadastrar Produto" && <ProductForm token={token} />}
        {submenu === "Listar / Editar Produtos" && (
          <ProductList token={token} />
        )}
        {submenu === "Categorias" && <CategoryManager token={token} />}
        {submenu === "Marcas" && <BrandForm token={token} />}
        {submenu === "Incluir Instalação" && <PageInstalation token={token} />}
      </HollowPage>
    </>
  );
};

export default RegisterProduct;
