import React, { useState } from "react";
import * as Wails from "@wailsapp/runtime";
import WaitZone from "./Wait";
import DropZone from "./Drop";
import Log from "./Log";
import DragSight from "./DragSight";

// TODO: set some way to zoom only the Drop zone
// also fine some way to be able to update dropzone size
function DragDrop() {
  const [dat, setData] = useState({
    Rv: [],
    version: -1,
    Log: [],
  });

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

  if (dat.version < 0) {
    window.backend.Basic.Flip("yes", Number(0)).then((data) => {
      console.log(data);
      setData(data);
    });
  }

  Wails.Events.On("List", (ata) => {
    if (dat.version !== ata.version) {
      setData(ata);
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flex: "2",
        flexWrap: "wrap",
        flexDirection: "row",
        height: "40rem",
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          width: "78%",
        }}
      >
        <div
          className="List"
          style={{
            border: "5rem solid rgba(255, 0, 0, 0.05)",
            height: "11rem",
          }}
        >
          <WaitZone items={dat.Rv} />
        </div>
        <div>----------------------------------------------------</div>
        <DragSight dat={dat} />
      </div>
      <div
        style={{
          width: "19%",
          border: "0.3rem solid yellow",
          height: "100%",
        }}
      >
        <Log list={dat.Log} />
      </div>
    </div>
  );
}

export default DragDrop;
