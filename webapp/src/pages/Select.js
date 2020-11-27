import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap'
import Answer from '../components/Answer'

function Select() {
  const [selected, setSelected] = useState();
  const [display, setDisplay] = useState();
  const [btnStyle, setBtnStyle] = useState({ display: 'none' });
  const apiDomain = useSelector(state => state.apiDomain);
  const text = useSelector(state => state.text);
  const marked = useSelector(state => state.marked);
  const dispatch = useDispatch();

  useEffect(() => {
    setDisplay(stringToDisplay(marked));
  }, [marked])

  function stringToDisplay(markedString) {
    let list = markedString.split('<ans>');
    let newList = [markedString.split('<ans>')[0]];
    for (let i = 1; i < list.length; i++) {
      let first = (list[0].length === 0 && i === 1)
      let ans = list[i].split('</ans>')[0];
      let remaining = (list[i].split('</ans>')[1]);
      let ansComponent = (<Answer ans={ans} index={i} first={first} key={i} />);
      newList.push(ansComponent);
      newList.push(remaining);
    }
    return newList;
  }

  function handleProceed() {
    let wq = [];
    let gq = [];
    let formData = new FormData();
    formData.append('context', marked);

    dispatch({ type: 'LOADING', payload: true })
    fetch(apiDomain + '/wh', {
      body: formData,
      method: 'POST'
    }).then(response => {
      return response.text();
    }).then(data => {
      wq = JSON.parse(data);
      dispatch({ type: 'WQ', payload: wq });

      let formData = new FormData();
      formData.append('context', text);

      fetch(apiDomain + '/grammar', {
        body: formData,
        method: 'POST'
      }).then(response => {
        return response.text();
      }).then(data => {
        gq = JSON.parse(data);
        dispatch({ type: 'GQ', payload: gq });

        dispatch({ type: 'SUBMITTED', payload: true });
        dispatch({ type: 'PAGE', payload: 'results' });
      });
    }).catch(error => {
      dispatch({ type: 'ERROR', payload: error.message })
    }).finally(() => {
      dispatch({ type: 'LOADING', payload: false });
    });
  }

  function handleSelect(e) {
    const str = window.getSelection().toString().trim();
    setSelected(str);
    if (str) {
      const x = e.clientX;
      const y = e.clientY - 40;
      setBtnStyle({
        display: 'block',
        position: 'absolute',
        top: y,
        left: x,
        zIndex: '10'
      });
    } else {
      setBtnStyle({
        display: 'none'
      })
    }
  }

  function handleAdd() {
    setBtnStyle({
      display: 'none'
    })
    const anchorNodeContext = window.getSelection().anchorNode.textContent;
    const start = marked.indexOf(anchorNodeContext) + window.getSelection().anchorOffset;
    if (start === undefined || selected === '') return;
    let a = marked.substring(0, start);
    let b = marked.substring(start);
    b = b.replace(selected, '<ans>' + selected + '</ans>');
    console.log(start);
    dispatch({ type: 'MARKED', payload: a + b });
  }

  function removeAll() {
    dispatch({ type: 'MARKED', payload: text });
  }

  return (
    <div style={{ whiteSpace: 'pre-line' }}>
      <div className='border rounded p-2 mb-2'>
        <Button variant="success" size="sm" style={btnStyle} onClick={handleAdd}>
          +
        </Button>

        <div onMouseUp={handleSelect} style={{ minHeight: '30rem' }}>
          {display}
        </div>
      </div>
      <div>*Highlight text to add keywords</div>
      <div>*If no keywords, only grammar questions will be generated</div>

      <div className="mb-2 clearfix">
        <Button variant="primary" className='float-right ml-3' onClick={handleProceed}>
          Proceed
        </Button>
        <Button variant="warning" className='float-right ml-3' onClick={removeAll}>
          Remove all
        </Button>
      </div>
    </div>
  );
}

export default Select;