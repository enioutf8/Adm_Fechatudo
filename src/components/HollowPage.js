import Card from "react-bootstrap/Card";
import "./HollowPage.css";
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { MdKeyboardArrowRight } from "react-icons/md";

const HollowPage = ({ children }) => {
  const { currentMenuSelected } = useContext(GlobalContext);

  return (
    <Card className="hollow-page">
      <Card.Header>
        {currentMenuSelected.item}
        {currentMenuSelected.subItem && <MdKeyboardArrowRight />}
        {currentMenuSelected.subItem}
      </Card.Header>

      <Card.Body className="body-hollow-page">
        {children} {/* Aqui será renderizado o componente passado */}
      </Card.Body>

      <Card.Footer></Card.Footer>
    </Card>
  );
};

export default HollowPage;
