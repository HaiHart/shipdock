import React, { useState } from "react";
import DropZone from "./Drop";

function DragSight({ dat, box }) {
  const [size, setSize] = useState({
    width: 1,
    height: 40,
    scale: 1,
  });

  const ZoomWheel = (e) => {
    if (!e.shiftKey) {
      return;
    }
    const delta = e.deltaY * -0.001;
    const newScale = delta + size.scale;
    setSize({
      width: size.width,
      height: size.height,
      scale: newScale,
    });
  };
  console.log(box)
  return (
    <div
      onWheelCapture={ZoomWheel}
      style={{
        height:
          (((box.y) === 0) || (box.set === false))
            ? "calc(100% - 40rem)"
            : `calc(${box.y}*10rem)`,
        width: 
          (((box.x) === 0) || (box.set === false))
            ? "" 
            : `calc(${box.x}*10rem)`,
        overflowX: "scroll",
        overflowY: "scroll",
      }}
    >
      <div
        style={{
          transformOrigin: "0 0",
          transform: `scale(${size.scale})`,
        }}
      >
        <div
          style={{
            height: "5rem",
            width: "90rem",
            border: "5rem solid yellow",
            backgroundColor: "yellow",
            display: "flex",
            flex: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
        >
          {[...Array(8)].map((x, i) => {
            return <DropZone items={dat.Rv} id={i} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default DragSight;
