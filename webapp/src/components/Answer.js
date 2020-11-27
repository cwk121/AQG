import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ButtonGroup, Button } from 'react-bootstrap'
import './Answer.css'

function Answer(props) {
  const marked = useSelector(state => state.marked);
  const dispatch = useDispatch();
  const ans = props.ans;
  const index = props.index;
  const first = props.first;

  function handleDelete() {
    let chunks = marked.split(/(?=<ans>)/g);
    if(first){
      chunks[0] = chunks[0].replace('<ans>', '').replace('</ans>', '');
    } else {
      if(marked.startsWith('<ans>')){
        chunks[index-1] = chunks[index-1].replace('<ans>', '').replace('</ans>', '');
      } else {
        chunks[index] = chunks[index].replace('<ans>', '').replace('</ans>', '');
      }
    }
    dispatch({ type: 'MARKED', payload: chunks.join('') })
  }

  return (
    <ButtonGroup className='unselectable my-1'>
      <Button variant="primary" href="#" disabled size="sm">{ans}</Button>
      <Button variant="danger" size="sm" onClick={handleDelete}>×</Button>
    </ButtonGroup>
  )
}

export default Answer;