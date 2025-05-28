import React from "react";
import { Modal, Button } from "react-bootstrap";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

function DetailResult({ handleClose, show, data }) {
  return (
    <>
      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Result Translation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JsonView
            data={data}
            shouldExpandNode={allExpanded}
            style={defaultStyles}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DetailResult;
