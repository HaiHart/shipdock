import React, { useState } from "react";

export default function Log({ list }) {
  const [scale, setScale] = useState(1);
  const ZoomWheel = (e) => {
    if (!e.shiftKey) {
      return;
    }
    const delta = e.deltaY * -0.001;
    const newScale = delta + scale;
    setScale(newScale);
  };

  return (
    <div
      style={{
        width: "19%",
        border: "0.3rem solid yellow",
        height: "100%",
        overflowY: "scroll",
        overflowX: "scroll",
      }}
    >
      <div
        onWheelCapture={ZoomWheel}
        style={{
          width: "100%",
          height: "100%",
          flex: "1",
          transformOrigin: "0 0",
          transform: `scale(${scale})`,
        }}
      >
        {[...list].reverse().map((ele) => {
          if (ele.length < 1) {
            return <div></div>;
          }
          return (
            <div>
              <div
                style={{
                  paddingLeft: "0.25rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "2rem",
                  fontSize: "0.9rem",
                }}
              >
                {String(ele)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
