import React, { useState } from "react";
import Modal from "react-modal";
import Mold from "./DropMold";

function HelloWorld() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="App">
      <button onClick={() => handleOpenModal()} type="button">
        Drag And Drop
      </button>
      <Modal
        appElement={document.getElementById("app")}
        isOpen={showModal}
        contentLabel="Minimal Modal Example"
      >
        <button onClick={() => handleCloseModal()}>Close Modal</button>
        <Mold />
      </Modal>
    </div>
  );
}

export default HelloWorld;
