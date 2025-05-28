import Form from "react-bootstrap/Form";
import { ListGroup, Button, Card } from "react-bootstrap";
import { useState } from "react";
import Swal from "sweetalert2";
import { LuDownload } from "react-icons/lu";
import DetailResult from "./DetailResult";
const API_URL = "http://127.0.0.1:8000/translate";
const API_METHOD = "POST";
const STATUS_IDLE = 0;
const STATUS_UPLOADING = 1;
function FileInput() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(STATUS_IDLE);
  const [contents, setContents] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const uploadFiles = (data) => {
    Swal.fire({
      title: "Processing",
      html: "Please wait for some minutes.",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
    setStatus(STATUS_UPLOADING);
    fetch(API_URL, {
      method: API_METHOD,
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.files.forEach((file) => {
          setContents((prev) => [...prev, file]);
        });
      })
      .catch((err) => console.error(err))
      .finally(() => {
        Swal.close();
        setStatus(STATUS_IDLE);
      });
  };

  const packFile = (files) => {
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("files", files[i]); // harus pakai nama yang sama dengan param FastAPI
    }

    return data;
  };

  const handleUploadClick = () => {
    if (files.length) {
      const data = packFile(files);
      uploadFiles(data);
    }
  };

  const renderFileList = () => {
    return (
      <ListGroup>
        {[...files].map((file, index) => {
          // console.log(file);
          return (
            <ListGroup.Item key={index}>
              {file.name} - {file.type}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  };

  const downloadTranslate = (data) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(JSON.parse(data.content, null, 2))
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = data.filename;

    link.click();
  };

  const getButtonStatusText = () =>
    status === STATUS_IDLE ? "Submit" : "Uploading";

  return (
    <>
      <Form.Group controlId="formFileLg" className="mb-3">
        <Form.Label className="text-warning-emphasis">
          Please Input The Files. Extension format allowed is JSON.
        </Form.Label>
        <Form.Control
          type="file"
          multiple
          size="lg"
          onChange={(e) => setFiles(e.target.files)}
        />
      </Form.Group>
      {renderFileList()}

      <Button
        className="mt-3"
        variant="primary"
        onClick={handleUploadClick}
        disabled={status === STATUS_UPLOADING}
      >
        {getButtonStatusText()}
      </Button>
      {contents.length > 0 && (
        <div className="d-flex justify-content-end">
          <Button
            className="btn-download"
            variant="primary"
            onClick={() =>
              contents.forEach((content) => {
                downloadTranslate(content);
              })
            }
          >
            Download All <LuDownload />
          </Button>
        </div>
      )}

      {contents
        .filter((content) => content.content)
        .map((content, index) => (
          <Card key={index} className="mt-4">
            <Card.Body className="d-flex justify-content-between align-items-center">
              {content.filename}{" "}
              <div>
                <Button variant="primary" onClick={handleShow}>
                  Detail
                </Button>
                <DetailResult
                  handleClose={handleClose}
                  show={show}
                  data={content.content}
                />
                <Button
                  className="btn-download"
                  onClick={() => downloadTranslate(content)}
                  variant="link"
                >
                  <LuDownload className="text-primary" />
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
    </>
  );
}

export default FileInput;
