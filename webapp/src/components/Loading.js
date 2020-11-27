import React from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import './Loading.css';

function Loading() {
  const loading = useSelector(state => state.loading);
  
  if(loading){
    return (
      <div className='loading'>
        <Spinner animation="border" />
        <div>
          Loading...
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default Loading;