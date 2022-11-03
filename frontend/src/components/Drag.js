import React from "react";
import {useDrag} from 'react-dnd';

function Drag({id,name, draggable}){

    // const 

    const [{isDragging},drag] = useDrag((monitor)=>({
       type: 'image',
        item:{Id: id},
        collect:(monitor)=>({
            isDragging:!!monitor.isDragging(),
        })
    }),)

    return (
        <div style={{
            backgroundColor: "black",
            color: "white",
            visibility: isDragging ? "hidden":"",
            text_align: 'justify', 
            width:'50px',
            height: '50px',
        }} ref={draggable ? drag:{}}
        >
            {id} {name}
        </div>
    )
}



export default Drag