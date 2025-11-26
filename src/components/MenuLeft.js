import React, { useContext, useEffect, useState } from "react";
import "./MenuLeft.css";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";
import { GlobalContext } from "../context/GlobalContext";

const MenuLeft = () => {
  const { MenuPrincipal, setCurrentMenuSelected } = useContext(GlobalContext);
  const [openMenus, setOpenMenus] = useState({});
 
  const [selectedId, setSelectedId] = useState(MenuPrincipal[0]?.id || null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [selectedParent, setSelectedParent] = useState(
    MenuPrincipal[0]?.label || ""
  );

  useEffect(() => {
    setCurrentMenuSelected({
      item: selectedParent || "Pedidos",
      subItem: selectedSubItem?.label || "Pedidos em Aberto",
    });
  }, [selectedParent, selectedSubItem, setCurrentMenuSelected]);

  const toggleMenu = (id) => {
    console.log(id)
    setOpenMenus((prev) => {
      const isOpen = prev[id];

      return isOpen ? {} : { [id]: true };
    });
  };

  const renderMenu = (items, parentLabel = null) => {
    return (
      <ul>
        {items.map((item) => {
          const isParent = !!item.submenus && item.submenus.length > 0;
          const isSubItemSelected =
            selectedSubItem && selectedSubItem.id === item.id;

          return (
            <li key={item.id}>
              <div
                className={`menu-item ${isParent ? "has-sub" : ""} ${
                  selectedId === item.id || isSubItemSelected ? "selected" : ""
                }`}
                onClick={() => {
                  if (isParent) {
                    const firstSubmenu = item.submenus[0];

                    if (firstSubmenu) {
                      setSelectedId(firstSubmenu.id);

                      setSelectedSubItem(firstSubmenu);

                      setSelectedParent(item.label);
                    } else {
                      setSelectedId(item.id);
                      setSelectedParent(item.label);
                      setSelectedSubItem(null);
                    }

                    toggleMenu(item.id);
                  } else {
                    setSelectedId(item.id);

                    if (parentLabel) {
                      setSelectedSubItem(item);
                      setSelectedParent(parentLabel);
                    } else {
                      setSelectedParent(item.label);
                      setSelectedSubItem(null);
                    }
                  }
                }}
              >
                {item.label}
                {isParent && (
                  <span className="arrow">
                    {openMenus[item.id] ? (
                      <MdKeyboardArrowUp />
                    ) : (
                      <MdKeyboardArrowDown />
                    )}
                  </span>
                )}
              </div>

              {isParent &&
                openMenus[item.id] &&
                renderMenu(item.submenus, item.label)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="left-menu-container">
      <div className="bg-dark logo-login-dashboard text-center mb-4 text-dark">
        <img src="/logo_footer_linear.png" alt="Logo" />
      </div>
      <div className="body-menus">{renderMenu(MenuPrincipal)}</div>
    </div>
  );
};

export default MenuLeft;
