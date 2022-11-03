import React from "react";
import {  useDrop } from "react-dnd";
import Drag from "./Drag";

function DropZone({items, id, setList}) {

    const [{isOver},drop]= useDrop(()=>({
        accept:'image',
        drop:(item) => addItem(item.Id),
        collect:(monitor)=>({
            isOver: !!monitor.isOver(),
        })
    }))

    const addItem=(item)=>{
        if (item<=0 ){
            return
        }
        

        window.backend.Basic.Flip( String(item), Number(id)).then((data)=>{
            console.log(data)
            setList(data.Rv)
        })

        return
    
    }


    return (<div className="Drop" style={{
                border: isOver? '50px solid rgba(255, 0, 0, 0.05)':'50px solid yellow',
                width: '50px',
                height: '50px',
                color: 'blue',
                visibility: 'visible',
                alignSelf: "flex-start",
                backgroundColor:'white',
            }}
                ref={drop}
            >
                {items.map((item)=>{
                    if (item.Placed === id){
                        return (<Drag draggable={true} id={item.Id} name={item.Name}/>)
                    }else{
                        return (<></>)
                    }
                })}
            </div>)
}

export default DropZone