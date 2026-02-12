import React from "react";
import "./Header.css" ;

function Header(props){
    return(
    <div className="Header-title">
        <div className="hip">
          <div className="hicon">{props.icon}</div>
        </div>
        <div className="hwn">
          <h1>EventRatePro</h1>
        </div>
    </div>
);
}

export default Header;