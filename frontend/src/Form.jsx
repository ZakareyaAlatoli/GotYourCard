import React from "react";

export default function Form({children, onSubmit}){
    function submit(evt){
        evt.preventDefault();
        const formData = new FormData(evt.target);
        const values = Object.fromEntries(formData);
        onSubmit(values);
    }
    return(
        <form onSubmit={submit}>
            {children}
        </form>
    )
}