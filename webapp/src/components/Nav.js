import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ListGroup } from 'react-bootstrap';
import './Loading.css';

function Nav() {
  const page = useSelector(state => state.page);
  const marked = useSelector(state => state.marked);
  const submitted = useSelector(state => state.submitted);
  const dispatch = useDispatch();

  return (
    <ListGroup horizontal className='mb-2'>
      <ListGroup.Item
        action
        active={page === 'home'}
        onClick={() => dispatch({ type: 'PAGE', payload: 'home' })}>
        1: Input Text
      </ListGroup.Item>
      <ListGroup.Item
        action
        active={page === 'select'}
        disabled={marked === ''}
        onClick={() => dispatch({ type: 'PAGE', payload: 'select' })}>
        2: Select Keywords
      </ListGroup.Item>
      <ListGroup.Item
        action
        active={page === 'results'}
        disabled={!submitted}
        onClick={() => dispatch({ type: 'PAGE', payload: 'results' })}>
        3: Results
      </ListGroup.Item>
    </ListGroup>
  )
}

export default Nav;