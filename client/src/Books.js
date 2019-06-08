import React, { Component } from 'react';
import axios from 'axios';

function Book(props) {
    return (
      <li>
          <strong>{props.value.title}</strong>
      </li>
    );
  }

class Books extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      data: '',
    }
  }

  componentDidMount() {
    this.callApi()
      .then(res => {
          //this.setState({ title: res.title, data: res.book_list });
          console.log(res);
        })
      .catch(err => console.log(err));

    this.callApiReq()
      .then(res => {
          //this.setState({ title: res.title, data: res.book_list });
          console.log(res);
        })
      .catch(err => console.log(err));
  }

  callApi = async() => {
    const response = await axios.get('/catalog/books');
    const body = await response["data"];
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  renderBook(book_data) {
    return <Book 
      key={book_data._id}
      value={book_data}
    />;
  }

  render() {
    let arr = [];
    if (this.state.data) {
      this.state.data.map(book_data => arr.push(book_data));
    }
    return (
      <div>
        <h2>Local Library Home</h2>
        <p>Welcome to {this.state.title}, a very basic Express website as a tutorial example</p>
        <h2>Dynamic content</h2>
        <ul>
          {
            arr.map(book_data => {
              return this.renderBook(book_data);
            })
          }
        </ul>
      </div>
    );
  }
}

export default Books;