import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
import { appTheme } from './AppTheme';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Slider from '@material-ui/core/Slider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { MuiThemeProvider, makeStyles } from '@material-ui/core/styles'; // v1.x
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box';
import LoginMessage from './LoginMessage'
//import { chnageState } from './home/db';

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(1),
  },
}));

const RiscoAction = Object.freeze({
  ARMED: 1,
  PARTIALLY_ARMED: 2,
  DISARMED: 3,
});


const marks = [
  {
    value: 1,
    label: 'Partial',
    label_short: 'Part',
    state: RiscoAction.PARTIALLY_ARMED,
  },
  {
    value: 50,
    label: 'Disarm',
    label_short: 'Dis',
    state: RiscoAction.DISARMED,
  },
  {
    value: 100,
    label: 'Arm',
    label_short: 'Arm',
    state: RiscoAction.ARMED,
  },
];

const style = {
  margin: 15,
};

function RiscoDevice(props) {
  const classes = useStyles();

  const [alarmState, setAlarmState] = useState(null);

  const getRiscoState = async (device_id) => {
    const apiBaseUrl = "/home-keeper";

    const payload = {
      "device_id": device_id,
    }

    await axios.post(apiBaseUrl + '/device/getState', payload).then(function (response) {
      if (response.status == 200) {
        const state = response.data.state;
        setAlarmState(state);
      } else {
        return null;
      }
    })
    .catch(function (error) {
      return null;
    });
  }

  const setRiscoState = async (device_id, state) => {
    const apiBaseUrl = "/home-keeper";

    const payload = {
      "device_id": device_id,
      "state": state,
    }

    await axios.post(apiBaseUrl + '/device/setState', payload).then(function (response) {
      if (response.status == 200) {
        const state = response.data.state;
        setAlarmState(state);
      } else {
        return null;
      }
    })
    .catch(function (error) {
      return null;
    });
  }

  useEffect(() => {
    getRiscoState(props.device_id);
  }, []);

  function valuetext(value) {
    return `${value}`;
  }
  
  function valueLabelFormat(value) {
    return marks.find(mark => mark.value === value).label_short;
  }

  async function handleSliderChange(event, value) {
    // TODO: prevent unneeded setChange calls using `event.target`;
    const state = marks.find(mark => mark.value == value).state;
    setTimeout(function() { 
      setAlarmState(null); 
    }, 600);
    await setRiscoState(props.device_id, state);
  }

  return (
    <div className="device-container">
      <MuiThemeProvider theme={appTheme}>
        <div>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" color="inherit">
                {props.name}
              </Typography>
            </Toolbar>
          </AppBar>
            {alarmState ? 
            <div className="device-slider-container">
            <Slider
              defaultValue={marks.find(mark => mark.state === alarmState).value}
              valueLabelFormat={valueLabelFormat}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-restrict"
              step={null}
              valueLabelDisplay="auto"
              marks={marks}
              onChangeCommitted={handleSliderChange}
            />
            </div>
            :
            <div className="device-slider-loading">
            <CircularProgress className={classes.progress} /> 
            </div>}
          </div>
      </MuiThemeProvider>
    </div>
  );
}

class Devices extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  renderDevice(device) {
    return <RiscoDevice 
      key={device.device_name}
      name={device.device_name}
      device_id={device._id}
    />;
  }

  render() {
    var userDetailsObj;
    if (!this.state.userDetails) {
      return <LoginMessage>You'll first need to sign in before using this app. Use the the button on the upper right corner of this app.</LoginMessage>
    } else {
      userDetailsObj = JSON.parse(this.state.userDetails);
      if (!userDetailsObj.accounts || userDetailsObj.accounts.length == 0) {
        return <LoginMessage>Hey {userDetailsObj.user.name}! You have not yet set up any device. Please set up a Risco device in Risco Login tab.</LoginMessage>
      }
    }

    console.log(userDetailsObj)

    // user is signed in and there is a device to display
    const accounts = userDetailsObj.accounts;

    // let arr = [];
    // if (this.state.data) {
    //   this.state.data.map(book_data => arr.push(book_data));
    // }
    return (
      <div>
        {
          accounts.map(device => {
            console.log(device)
            return this.renderDevice(device);
          })
        }
      </div>
    );
  }
}

export default Devices;