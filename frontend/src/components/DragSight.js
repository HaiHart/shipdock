import React, { useState } from "react";
import DropZone from "./Drop";

function DragSight({ dat }) {
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

  return (
    <div
      onWheelCapture={ZoomWheel}
      style={{
        height: "calc(100% - 40rem)",
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
