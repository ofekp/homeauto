import React, { Component } from 'react';

function LoginMessage(props) {
  return (
    <div>
    <div className="login">
      <div className="login-content">
      <h2 className="text-center">
        {props.title ? props.title : "Login Required"}
      </h2>
      <div className="content-text text-center">
        {props.children}
      </div>
      <div className="content-text content-small text-center">
        Only the email is used for the sole pupose of peronalizing the app. No spam will be sent and your details will not be passed to any third party.
      </div>
      </div>
    </div>
    </div>
  );
}

export default LoginMessage;