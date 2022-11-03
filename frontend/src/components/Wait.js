import React from "react";
import { useDrop } from "react-dnd";
import Drag from "./Drag";

function WaitZone({items, setList}) {

    const [{isOut},out]= useDrop(()=>({
        accept:'image',
        drop:(item) => outItem(item.Id),
        collect:(monitor)=>({
            isOut: !!monitor.isOver(),
        })
    }))
    const outItem=(item)=>{
        if (item<0){
            return
        }
        window.backend.Basic.Flip( String(item),Number(-1)).then((data)=>{
            console.log('out')
            // setList(data.Rv)
        })

        return
    
    }

    return (<div className="wait" style={{
                border: isOut? '5px solid rgba(0, 0, 0, 0.05)':'5px solid green',
                flexDirection: "row",
                flexWrap: "wrap",
                display: 'flex',
                flex:2,
                height: '100px'
            }}
                ref={out}
            >
                {items.map((item)=>{
                    if (item.Placed < 0){
                        return (<Drag draggable={true} id={item.Id} name={item.Name}/>)
                    }else{
                        return (<></>)
                    }
                })}
            </div>)
}

export default WaitZone