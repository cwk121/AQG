import React from 'react';
import './App.css';
import { Alert } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import Content from './Content'
import Loading from './components/Loading'
import Nav from '././components/Nav'

function App() {
  const error = useSelector(state => state.error);

  return (
    <div className='container'>
      <header>
        <h1>
          Automated Question Generator
        </h1>
      </header>
      <Nav />
      <Alert variant='warning' hidden={error===''}>
        {error}
      </Alert>
      <Loading />
      <Content />
    </div>
  );
}

export default App;