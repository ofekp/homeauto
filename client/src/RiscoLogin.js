import React, { Component } from 'react';
import axios from 'axios';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const style = {
  margin: 15,
};

class RiscoLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      pin: ''
    }
  }

  handleClick(event) {
    var apiBaseUrl = "/home-auto";
    var self = this;
    var payload = {
      "user": this.state.user,
      "user_name": this.state.username,
      "password": this.state.password,
      "additional_data": {"pin": this.state.pin},
      "account_type": "RISCO",
      "device_name": "risco"
    }
    axios.post(apiBaseUrl + '/account/create', payload).then(function (response) {
      console.log(response);
      if (response.data.code == 200) {
        console.log("Login successfull");
        var uploadScreen=[];
        uploadScreen.push(<UploadScreen appContext={self.props.appContext}/>)
        self.props.appContext.setState({loginPage:[],uploadScreen:uploadScreen})
      }
      else if (response.data.code == 204) {
        console.log("Username password do not match");
        alert("username password do not match")
      }
      else {
        console.log("Username does not exists");
        alert("Username does not exist");
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <div>
            <AppBar
              title="Risco Login"
            />
            <TextField
              hintText="Enter your Risco username"
              floatingLabelText="Username"
              onChange = {(event, newValue) => this.setState({username:newValue})}
            />
            <br/>
            <TextField
              type="password"
              hintText="Enter your Risco password"
              floatingLabelText="Password"
              onChange = {(event, newValue) => this.setState({password:newValue})}
            />
            <br/>
            <TextField
              type="password"
              hintText="Enter your Risco pin number"
              floatingLabelText="Pin"
              onChange = {(event, newValue) => this.setState({pin:newValue})}
            />
            <br/>
            <RaisedButton label="Submit" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
         </div>
         </MuiThemeProvider>
      </div>
    );
  }
}

export default RiscoLogin;