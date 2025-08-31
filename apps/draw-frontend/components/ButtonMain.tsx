import { ReactNode } from "react";

interface ButtonProp{
    className:string,
    text:string,
    onClick:()=>void,
    startIcon:ReactNode
}

export function ButtonMain({className,text,onClick,startIcon}:ButtonProp){


    return(
        <button
            onClick={onClick}
            className={className}
        >
            {startIcon}
            {text}
        </button>
    )
}