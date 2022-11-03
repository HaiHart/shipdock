import React, { useState } from "react";
import * as Wails from '@wailsapp/runtime'
import WaitZone from "./Wait";
import DropZone from "./Drop";


function DragDrop(){
   
       

    // const [ver,setVer] = useState(0)
    
    // const [drags,setDrags] = useState([])

    // const [board,setBoard] = useState([])

    const [list,setList] = useState([])
    const [ver,setVer] = useState(-1)


    if (list.length<1 && ver<0){
        window.backend.Basic.Flip("yes", Number(0)).then(data=>{
            setList(data.Rv)
            setVer(data.version)
            console.log(data)
        })
    }


    Wails.Events.On("List",(data)=>{

        if (data.version !== ver)
            setList(data.Rv)
            setVer(data.version)
        
    })

    return(
        <div style={{
            flex:1,
        }}>
            <div className="List" style={{
                border:'50px solid rgba(255, 0, 0, 0.05)',
                height: '100px',
                
            }}>
                <WaitZone items={list} setList={setList}/>
            </div>
            <div>
                ----------------------------------------------------
            </div>
            <div style={{
                border: '50px solid yellow',
                backgroundColor: 'yellow',
                display: 'flex',
                flex:8,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: 'space-evenly',
            }}>
                {
                    [...Array(8)].map((x,i)=>{
                        return(<DropZone items={list} setList={setList} id={i} />)
                    })
                }
            </div>
        </div>
    )
}

export default DragDrop;