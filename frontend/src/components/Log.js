import React from "react";

export default function Log({list}){

    return(
        <div style={{
            width: '100%',
            height: '100%',
            flex: '1',
            overflowY: 'scroll',
        }}>
            {list.reverse().map((ele)=>{
                if (ele.length<1){
                    return <div></div>
                }
                return(<div>
                    <div style={{
                        paddingLeft: '3rem',
                        paddingTop:'0.5rem',
                        paddingBottom:'2rem',
                    }}>
                        {String(ele)}
                    </div>
                </div>)
            })}
        </div>
    )
}