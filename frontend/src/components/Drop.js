import React from "react";
import {  useDrop } from "react-dnd";
import Drag from "./Drag";

function DropZone({items, id, setList}) {

    const [{isOver},drop]= useDrop(()=>({
        accept:'image',
        drop:(item) => addItem(item.Iden),
        collect:(monitor)=>({
            isOver: !!monitor.isOver(),
        })
    }))

    const addItem=(item)=>{
        if (item<=0 ){
            return
        }

        window.backend.Basic.Flip( String(item), Number(id)).then((data)=>{
            // console.log(id)
            // console.log(item)
        })

        return
    
    }


    return (<div className="Drop" style={{
                border: isOver? '3rem solid rgba(255, 0, 0, 0.05)':'3rem solid yellow',
                width: '2.5rem',
                height: '2.5rem',
                color: 'blue',
                visibility: 'visible',
                alignSelf: "flex-start",
                backgroundColor:'white',
            }}
                ref={drop}
            >
                {items.map((item)=>{
                    if (item.Placed === id){
                        return (<Drag draggable={true} Iden={item.Iden} name={item.Name}/>)
                    }else{
                        return (<></>)
                    }
                })}
            </div>)
}

export default DropZone