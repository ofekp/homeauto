import React, { Component } from 'react';
import axios from 'axios';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { getUserDetails } from './helpers/db';
import { Redirect } from 'react-router-dom';

const style = {
  margin: 15,
};

// continue with https://material-ui.com/components/app-bar/

class RiscoLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      pin: '',
      userDetails: null
    }
  }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  handleClick = async (event) => {
    var apiBaseUrl = "/home-auto";
    var userDetails = JSON.parse(this.state.userDetails);

    var payload = {
      "user": userDetails.user._id,
      "user_name": this.state.username,
      "password": this.state.password,
      "additional_data": {"pin": this.state.pin},
      "account_type": "RISCO",
      "device_name": "risco"
    }

    await axios.post(apiBaseUrl + '/account/create', payload).then(function (response) {
      console.log(response);
      if (response.status == 200) {
        console.log("Login successfull");
        this.setState({loginPage:[],uploadScreen:uploadScreen})
      } else {
        console.log("Error while creating the device");
        alert("Error while creating the device");
      }
    })
    .catch(function (error) {
      console.log(error);
    });

    userDetails = await getUserDetails(userDetails.user.email);
    const userDetailsStr = JSON.stringify(userDetails);
    localStorage.setItem('userDetails', userDetailsStr);
    this.setState(() => ({
      userDetails: userDetailsStr
    }))
  }

  render() {
    console.log(this.state.userDetails)
    console.log(!this.state.userDetails)
    if (!this.state.userDetails) {
      return <Redirect to='/' />
    }

    return (
      <div className="device-login">
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