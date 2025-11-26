import React, { useContext, useState } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import { GlobalContext } from "../../context/GlobalContext";
import "./MenuLeftMobile.css";

const MenuLeftMobile = () => {
  const { MenuPrincipal, setCurrentMenuSelected } = useContext(GlobalContext);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // id do menu principal selecionado

  const handleClick = (item, subItem = null) => {
    if (subItem) {
      setCurrentMenuSelected({
        item: item.label,
        subItem: subItem.label,
      });
    } else {
      setCurrentMenuSelected({
        item: item.label,
        subItem: "",
      });
    }
    setSelectedId(item.id); // sempre seleciona o item principal
    setOpenDropdown(null); // fecha dropdown
  };

  return (
    <div
      className="d-flex bottom-menu-container justify-content-around align-items-center fixed-bottom bg-white border-top"
      style={{ height: "60px", zIndex: 1000 }}
    >
      {MenuPrincipal.map((item) => (
        <div key={item.id} className="text-center">
          {item.submenus ? (
            <Dropdown
              as={ButtonGroup}
              show={openDropdown === item.id}
              onToggle={() =>
                setOpenDropdown(openDropdown === item.id ? null : item.id)
              }
              drop="up"
            >
              <Dropdown.Toggle
                variant="light"
                className={`d-flex flex-column align-items-center p-2 ${
                  selectedId === item.id ? "selected" : ""
                }`}
                id={`dropdown-${item.id}`}
              >
                <div className="icon">{item.icon}</div>
                <div className="label" style={{ fontSize: "12px" }}>
                  {item.label}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {item.submenus.map((sub) => (
                  <Dropdown.Item
                    key={sub.id}
                    onClick={() => handleClick(item, sub)}
                  >
                    {sub.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div
              className={`d-flex flex-column align-items-center p-2 ${
                selectedId === item.id ? "selected" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(item)}
            >
              <div className="icon">{item.icon}</div>
              <div className="label" style={{ fontSize: "12px" }}>
                {item.label}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuLeftMobile;
