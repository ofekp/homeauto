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

  render() {
    if (!this.state.userDetails) {
      return <Redirect to='/risco_login' />
    } else if (userDetails.accounts.length > 0) {
      return <Redirect to='/devices' />
    }
  }
}

export default Home;