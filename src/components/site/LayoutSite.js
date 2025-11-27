import React from "react";
import HollowPage from "../HollowPage";
import FormMenus from "./FormMenus";
import BannerEditorRow from "./BannerEditorRow";
import SubCategoryItemLayout from "./SubCategoryItemLayout";
import SubCategoryLayout from "./SubCategoryLayout";
import InstitutionalTextsCRUD from "./InstitutionalTextsCRUD";
import LayoutFooterCRUD from "./LayoutFooterCRUD";

const LayoutSite = ({ submenu, token }) => {
  return (
    <HollowPage>
      {submenu === "Menu e Navegação" && <FormMenus token={token} />}
      {submenu === "Banners" && <BannerEditorRow token={token} />}
      {submenu === "Sub Categorias" && <SubCategoryItemLayout token={token} />}
      {submenu === "Subcategorias Navegação" && (
        <SubCategoryLayout token={token} />
      )}
      {submenu === "Institucional" && <InstitutionalTextsCRUD token={token} />}
      {submenu === "Rodapé" && <LayoutFooterCRUD token={token} />}
    </HollowPage>
  );
};

export default LayoutSite;
