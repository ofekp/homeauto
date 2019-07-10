import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { getUserDetails } from './helpers/db';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: null
    }
  }

  // componentDidMount() {
  //   this.callApi()
  //     .then(res => {
  //         this.setState({ title: res.title, data: res.data });
  //       })
  //     .catch(err => console.log(err));
  // }

  // callApi = async() => {
  //   const response = await axios.get('/catalog');
  //   const body = await response["data"];
  //   if (response.status !== 200) throw Error(body.message);
  //   return body;
  // }

  componentWillMount() {
    const userDetails = localStorage.getItem('userDetails');
    this.setState(() => ({
      userDetails: userDetails,
    }));
  }

  render() {
    console.log(this.state.userDetails)
    if (!this.state.userDetails) {
      return <div>You'll first need to sign in before using this app.</div>
    } else {
      const userDetailsObj = JSON.parse(this.state.userDetails);
      if (!userDetailsObj.accounts || userDetailsObj.accounts.length == 0) {
        return <div>Hey {userDetailsObj.user.name}! you'll have to set up a device before you can use this app.</div>
      } else {
        return <div>Hey {userDetailsObj.user.name}!</div>
      }
    } 
  }
}

export default Home;