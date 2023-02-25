import React, { useState, useEffect } from "react";
import * as Wails from "@wailsapp/runtime";
import WaitZone from "./Wait";
import Log from "./Log";
import DragSight from "./DragSight";
import Axios from "axios";

// TODO: set some way to zoom only the Drop zone
// also fine some way to be able to update dropzone size
function DragDrop() {
  const [dat, setData] = useState({
    Rv: [],
    version: -1,
    Log: [],
  });
  const [size, setSize] = useState({
    x: 8,
    y: 1,
  });
  const [img, setImge] = useState(null);

  const [pos, setPos] = useState({
    x: 0,
    y: 0,
    path: "http://localhost:4000/img",
    cur_name: "",
  });

  if (dat.version < 0) {
    window.backend.Basic.Flip("yes", Number(0)).then((data) => {
      setData(data);
    });
  }

  Wails.Events.On("List", (ata) => {
    if (dat.version !== ata.version) {
      setData(ata);
    }
  });

  useEffect(() => {
    window.backend.Basic.GetImageFile().then((res) => {
      setPos({
        x: res.x,
        y: res.y,
      });
    });
  }, []);

  const saveCon = (e) => {
    e.preventDefault();
    if (img === null) {
      window.backend.Basic.SetImageFile(Number(pos.x), Number(pos.y)).then(
        (res) => {
          console.log(res);
        }
      );
      return;
    }
    const formData = new FormData();
    formData.append("Img", img);
    try {
      Axios.post("http://localhost:4000/save", formData).then((res) => {
        if (res.data) {
          console.log(res.data);
        }
      });

      window.backend.Basic.SetImageFile(Number(pos.x), Number(pos.y)).then(
        (res) => {
          console.log(res);
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setPos({
        ...pos,
        cur_name: img.name,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flex: "2",
        flexWrap: "wrap",
        flexDirection: "row",
        height: "100%",
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          width: "78%",
          height:"78%",
        }}
      >
        <div
          className="List"
          style={{
            border: "0.5rem solid rgba(255, 0, 0, 0.05)",
            height: "6rem",
          }}
        >
          <WaitZone items={dat.Rv} />
        </div>
        <div>------------------------------------------------------------------------------------------------------------------------------------</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            gap: "10px",
          }}
        >
          <div
            label="Change number of row, colum input"
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
            }}
          >
            <div>Change number of row, colum input</div>
            <input
              type="number"
              placeholder="Number of row for Block"
              onChange={(e) => {
                if (e.target.value === null || e.target.value === "") {
                  return;
                }
                if (e.target.value < 1) {
                  e.target.value = 1;
                  setSize({
                    y: Number(e.target.value),
                    x: size.x,
                    set: true,
                  });
                  return;
                }
                setSize({
                  y: Number(e.target.value),
                  x: size.x,
                  set: true,
                });
              }}
            />
            <input
              type="number"
              placeholder="Number of column for block"
              onChange={(e) => {
                if (e.target.value === null || e.target.value === "") {
                  return;
                }
                if (e.target.value < 1) {
                  e.target.value = 1;
                  setSize({
                    x: Number(e.target.value),
                    y: size.y,
                    set: true,
                  });
                  return;
                }
                setSize({
                  x: Number(e.target.value),
                  y: size.y,
                  set: true,
                });
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                setPos({
                  y: pos.y - 1,
                  x: pos.x,
                });
              }}
            >
              up
            </button>
            <input
              type="number"
              placeholder="Y background"
              value={pos.y}
              onChange={(e) => {
                if (e.target.value === null || e.target.value === "") {
                  return;
                }
                setPos({
                  y: Number(e.target.value),
                  x: pos.x,
                  path: pos.path,
                });
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setPos({
                  y: pos.y + 1,
                  x: pos.x,
                  path: pos.path,
                });
              }}
            >
              down
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                setPos({
                  y: pos.y,
                  x: pos.x + 1,
                  path: pos.path,
                });
              }}
            >
              right
            </button>
            <input
              type="number"
              placeholder="X background"
              value={pos.x}
              onChange={(e) => {
                if (e.target.value === null || e.target.value === "") {
                  return;
                }
                setPos({
                  x: Number(e.target.value),
                  y: pos.y,
                  path: pos.path,
                });
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setPos({
                  y: pos.y,
                  x: pos.x - 1,
                  path: pos.path,
                });
              }}
            >
              left
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
            }}
          >
            <input
              type="file"
              name="myImage"
              onChange={(event) => {
                setImge(event.target.files[0]);
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setImge(null);
                window.backend.Basic.RemoveImage().then((res) => {
                  console.log(res);
                });
              }}
            >
              Remove
            </button>
            <button onClick={saveCon}>Re-Config</button>
          </div>
        </div>
        <div>------------------------------------------------------------------------------------------------------------------------------------</div>
        <div style={{
          height:"100%",
        }}>
        <DragSight dat={dat} box={size} img={img} pos={pos} />
        </div>
      </div>

      <Log list={dat.Log} />
    </div>
  );
}

export default DragDrop;
