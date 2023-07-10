import React, { useState } from 'react'

const UsePasswordToogle = () => {
    const [visible,setVisibility] = useState(false);

    const Icon = (
        <i title = {visible ? "hide password": "show password"} class={visible ? "fa fa-eye-slash ": "fa fa-eye"} onClick={()=> setVisibility(visibility => !visibility)} ></i>
    );

    const InputType = visible ? "text" : "password";

    return [InputType, Icon];
}

export default UsePasswordToogle