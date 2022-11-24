import React, { useState } from "react";
import DropZone from "./Drop";

function DragSight({ dat, box, img , pos}) {
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
      style={{
        height: "calc(100% - 40rem)",
        backgroundImage: img!==null ? `url(${URL.createObjectURL( img)})`:'',
        // backgroundSize: "100% 100%",
        backgroundPosition: `${pos.x}px ${pos.y}px`,
        width:"100%",
      }}
    >
      <div
        onWheelCapture={ZoomWheel}
        style={{
          height: "calc(100% - 40rem)",
          overflowX: "scroll",
          overflowY: "scroll",
          paddingTop:`calc(5rem)`,
        }}
      >
        <div
          style={{
            height: "15rem",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            transformOrigin: "0 0",
            transform: `scale(${size.scale})`,
          }}
        >
          {[...Array(box.y)].map((_, y) => {
            return (
              <div
                style={{
                  height: "5rem",
                  width: "90rem",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-evenly",
                }}
              >
                {[...Array(box.x)].map((x, i) => {
                  return <DropZone items={dat.Rv} id={Number(i + y * box.x)} />;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DragSight;
