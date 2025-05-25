import React from "react";
import "./App.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import FileInput from "./components/fileInput";
function App() {
  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col lg={6}>
          <h3 className="text-center my-4">
            RPG Maker Translator To Indonesia
          </h3>
          <FileInput />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
