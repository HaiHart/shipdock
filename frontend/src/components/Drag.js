import React from "react";
import { useDrag } from "react-dnd";

function Drag({ Iden, name, draggable, wait }) {
  if (wait) {
  }
  const [{ isDragging }, drag] = useDrag((monitor) => ({
    type: "image",
    item: { Iden: Iden, Name: name },
    collect: (monitor) => {
      return {
        isDragging: !!monitor.isDragging(),
      };
    },
  }));

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        visibility: isDragging ? "hidden" : "",
        text_align: "justify",
        width: "3rem",
        height: "3rem",
      }}
      ref={draggable ? drag : {}}
    >
      {Iden} {name}
    </div>
  );
}

export default Drag;
