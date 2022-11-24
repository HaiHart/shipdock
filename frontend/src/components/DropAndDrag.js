import React, { useState } from "react";
import * as Wails from "@wailsapp/runtime";
import WaitZone from "./Wait";
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
  const [size,setSize]=useState({
    x:0,
    y:0,
    set:false,
  })
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
        <div>-------------------------------------</div>
        <div>
          <input
            type="number"
            placeholder="Y"
            onChange={(e)=>{
              if(e.target.value === null || e.target.value === ''){
                return
              }
              if(e.target.value<0){
                e.target.value = 0
                return
              }
              if (e.target.value>3){
                e.target.value = 3
                setSize({
                  y:Number(e.target.value),
                  x:size.x,
                  set:true,
                })
                return
              }
              setSize({
                y:Number(e.target.value),
                x:size.x,
                set:true,
              })
            }}
          />
          <input
            type ="number"
            placeholder="X"
            onChange={(e)=>{
              if(e.target.value === null || e.target.value === ''){
                return
              }
              if(e.target.value<0){
                e.target.value = 0
                return
              }
              if (e.target.value>8){
                e.target.value = 8
                setSize({
                  x:Number(e.target.value),
                  y:size.y,
                  set:true,
                })
                return
              }
              setSize({
                x:Number(e.target.value),
                y:size.y,
                set:true,
              })
            }}
          />          
        </div>
        <div>-------------------------------------</div>
        <DragSight dat={dat} box={size}/>
      </div>

      <Log list={dat.Log} />
    </div>
  );
}

export default DragDrop;
