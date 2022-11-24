import React from "react";
import { useDrop } from "react-dnd";
import Drag from "./Drag";

function DropZone({ items, id}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "image",
    drop: (item) => addItem(item.Iden),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addItem = (item) => {
    if (item <= 0) {
      return;
    }

    window.backend.Basic.Flip(String(item), Number(id)).then((data) => {
    });

    return;
  };


  return (
    <div
      className="Drop"
      style={{
        border: isOver
          ? "1rem solid rgba(255, 0, 0, 0.05)"
          : "1rem solid yellow",
        width: "3rem",
        height: "3rem",
        color: "blue",
        visibility: "visible",
        alignSelf: "flex-start",
        backgroundColor: "white",
      }}
      ref={drop}
    >
      {items.map((item) => {
        if (item.Placed === id) {
          return <Drag draggable={true} Iden={item.Iden} name={item.Name} />;
        } else {
          return <></>;
        }
      })}
    </div>
  );
}

export default DropZone;
