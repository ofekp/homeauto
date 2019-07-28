import React, { Component, useState } from 'react';
import { getUserDetails } from './helpers/db';
import { appTheme } from './AppTheme';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import LoginMessage from './LoginMessage';

import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider, makeStyles } from '@material-ui/core/styles'; // v1.x
import Button from '@material-ui/core/Button'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    //marginLeft: theme.spacing(1),
    //marginRight: theme.spacing(1),
    width: 256,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
});

const style = {
  margin: 15,
};

function RiscoForm(props) {
  const classes = useStyles();

  const [form, setValues] = useState({
    username: '',
    password: '',
    pin: '',
  });

  const updateField = event => {
    setValues({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleClick = async (event) => {
    const apiBaseUrl = "/home-keeper";
    const userDetailsObj = JSON.parse(props.userDetails);

    const payload = {
      "user": userDetailsObj.user._id,
      "user_name": form.username,
      "password": form.password,
      "additional_data": {"pin": form.pin},
      "account_type": "RISCO",
      "device_name": "risco"
    }

    await axios.post(apiBaseUrl + '/account/create', payload).then(function (response) {
      console.log(response);
      if (response.status === 200) {
        console.log("Device updated successfully");
      } else {
        console.log("Error while creating the device");
        alert("Error while creating the device");
      }
      form.username = ""
      form.password = ""
      form.pin = ""
    })
    .catch(function (error) {
      console.log(error);
    });

    const userDetails = await getUserDetails(userDetailsObj.user.email);
    console.log(userDetails)
    const userDetailsStr = JSON.stringify(userDetails);
    localStorage.setItem('userDetails', userDetailsStr);
    props.updateUserDetails(userDetailsStr);
  }

  return (
    <div className="device-container">
      <MuiThemeProvider theme={appTheme}>
        <div>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" color="inherit">
                Risco Device
              </Typography>
            </Toolbar>
          </AppBar>
          <TextField
            id="standard-text-input"
            label="Username"
            className={classes.textField}
            type="text"
            autoComplete="current-password"
            margin="normal"
            name="username"
            value={form.username}
            onChange = {updateField}
          />
          <br/>
          <TextField
            id="standard-password-input"
            label="Password"
            className={classes.textField}
            type="password"
            autoComplete="current-password"
            margin="normal"
            name="password"
            value={form.password}
            onChange = {updateField}
          />
          <br/>
          <TextField
            id="standard-pin-input"
            label="Pin"
            className={classes.textField}
            type="password"
            autoComplete="current-password"
            margin="normal"
            name="pin"
            value={form.pin}
            onChange = {updateField}
          />
          <br/>
          <Button variant="contained" color="primary" style={style} onClick={(event) => handleClick(event)}>SUBMIT</Button>
       </div>
      </MuiThemeProvider>
    </div>
  );
}

class RiscoLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  updateUserDetails = (userDetails) => {
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  render() {
    if (!this.state.userDetails) {
      return <LoginMessage>You'll first need to sign in before using this app. Use the the button on the upper right corner of this app.</LoginMessage>
    }

    return <RiscoForm userDetails={this.state.userDetails} updateUserDetails={this.updateUserDetails} />;
  }
}

export default RiscoLogin;