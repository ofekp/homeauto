import React, { Component } from 'react';
import axios from 'axios';

class Home extends Component {
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
          this.setState({ title: res.title, data: res.data });
        })
      .catch(err => console.log(err));
  }

  callApi = async() => {
    const response = await axios.get('/catalog');
    const body = await response["data"];
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  render() {
    return (
      <div>
        <h2>Local Library Home</h2>
        <p>Welcome to {this.state.title}, a very basic Express website as a tutorial example</p>
        <h2>Dynamic content</h2>
        <ul>
          <li><strong>Books: </strong> {this.state.data.book_count}</li>
          <li><strong>Copies: </strong> {this.state.data.book_instance_count}</li>
          <li><strong>Available copies: </strong> {this.state.data.book_instance_available_count}</li>
          <li><strong>Authors: </strong> {this.state.data.author_count}</li>
          <li><strong>Genres: </strong> {this.state.data.genre_count}</li>
        {/* li #[string Books:] !{data.book_count}
      li #[string Copies:] !{data.book_instance_count}
      li #[string Available copies:] !{data.book_instance_available_count}
      li #[string Authors:] !{data.author_count}
      li #[string Genres:] !{data.genre_count} */}
        </ul>
      </div>
    );
  }
}

export default Home;