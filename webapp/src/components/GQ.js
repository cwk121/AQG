import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap'

function GQ(props) {
  const [choices, setChoices] = useState([]);
  const gq = useSelector(state => state.gq);
  const dispatch = useDispatch();
  const data = props.data;
  const index = props.index;

  useEffect(() => {
    let tempChoices = data.distractors.slice(0).splice(0, 3);
    tempChoices.push(data.answer);
    tempChoices.sort((a, b) => 0.5 - Math.random());
    setChoices(tempChoices)
  }, [data])

  function shuffle() {
    setChoices(choices.slice(0).sort((a, b) => 0.5 - Math.random()));
  }

  function handleDelete() {
    let newGQ = gq.slice(0)
    newGQ.splice(index, 1)
    dispatch({ type: 'GQ', payload: newGQ })
  }

  function num2letter(i){
    if(i === 0) return 'A';
    if(i === 1) return 'B';
    if(i === 2) return 'C';
    if(i === 3) return 'D';
  }

  return (
    <div className='p-2 mb-2'>
      <div>
        {index + 1}) {data.question}
        <Button onClick={shuffle} variant="outline-primary" size='sm' className='ml-2'>
          Shuffle
        </Button>
        <Button onClick={handleDelete} variant="outline-danger" size='sm' className='ml-2'>
          Delete
        </Button>
      </div>
      <div>
        <div hidden={props.hideAns}>
          <strong>Answer:</strong> {data.answer}
        </div>
        {choices.map((choice, i) => (
          <div key={i}>
            {num2letter(i)}) {choice}
          </div>
        ))}
      </div>
      <br />
    </div>
  )
}

export default GQ;