import React from "react";
import "./Button.css";

function Button({ children, onClick, type = "button", style = {}, ...props }) {
  return (
    <button
      className="custom-btn"
      type={type}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
