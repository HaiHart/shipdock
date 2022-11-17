import React, { useState } from "react";
import * as Wails from '@wailsapp/runtime'
import WaitZone from "./Wait";
import DropZone from "./Drop";
import Log from "./Log";

// TODO: set some way to zoom only the Drop zone
// also fine some way to be able to update dropzone size
function DragDrop(){

    const [dat,setData] = useState({
        Rv: [],
        version: -1,
        Log: [],
    })

    const [scale, setScale] = useState(1)

    const ZoomWheel = (e)=>{
        if (!e.shiftKey){
            return
        }
        const delta = e.deltaY * -0.001
        const newScale = delta + scale
        setScale(newScale)
    }

    if (dat.version<0){
        window.backend.Basic.Flip("yes", Number(0)).then(data=>{
            console.log(data)
            setData(data)
        })
    }


    Wails.Events.On("List",(ata)=>{

        if (dat.version !== ata.version){
            setData(ata)
        }
    })

    return(
        <div style={{
            display: 'flex',
            flex: '2',
            flexWrap:'wrap',
            flexDirection: 'row',
            height:'40rem',
        }}>
            <div style={{
                alignSelf: "flex-start",
                width: '78%',
            }}>
            <div className="List" style={{
                border:'5rem solid rgba(255, 0, 0, 0.05)',
                height: '11rem',
                
            }}>
                <WaitZone items={dat.Rv} />
            </div>
            <div>
                ----------------------------------------------------
            </div>
            <div onWheelCapture={ZoomWheel} style={{
                height:'calc(100% - 40rem)',
                overflowX:'scroll',
                overflowY:'scroll',
            }}>
                <div style={{
                    border: '5rem solid yellow',
                    backgroundColor: 'yellow',
                    display: 'flex',
                    flex:8,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: 'space-evenly',
                    transformOrigin: "0 0",
                    transform: `scale(${scale})`,
                }}>
                    {
                        [...Array(8)].map((x,i)=>{
                            return(<DropZone items={dat.Rv} id={i} />)
                        })
                    }
                </div>
            </div>

                </div>
                <div style={{
                    width:'19%',
                    border: '0.3rem solid yellow',
                    height: '100%',
                    
                }}>
                    <Log list={dat.Log}/>
                </div>
        </div>
    )
}

export default DragDrop;