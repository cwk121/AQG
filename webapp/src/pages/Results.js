import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ListGroup, Form, Button } from 'react-bootstrap';
import WQ from '../components/WQ';
import GQ from '../components/GQ';

function Results() {
  const [tab, setTab] = useState()
  const [hideAns, setHideAns] = useState(false)
  const wq = useSelector(state => state.wq);
  const gq = useSelector(state => state.gq);

  useEffect(() => {
    if (wq.length === 0) {
      setTab('gq');
    } else {
      setTab('wq');
    }
  }, [wq])

  function CopyToClipboard() {
    let range = document.createRange();
    range.selectNode(document.getElementById('results'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }

  function handleChange(e) {
    if (e.target.checked) {
      setHideAns(false);
    } else {
      setHideAns(true);
    }
  }

  return (
    <div>
      <ListGroup horizontal className='mb-2 text-center'>
        <ListGroup.Item
          action
          active={tab === 'wq'}
          onClick={() => setTab('wq')}>
          Wh Questions
        </ListGroup.Item>
        <ListGroup.Item
          action
          active={tab === 'gq'}
          onClick={() => setTab('gq')}>
          Grammar Questions
        </ListGroup.Item>
      </ListGroup>

      <div className='border rounded p-2 mb-2'>
        <div className="d-flex justify-content-between p-2 border-bottom">
          <div>
            <Form.Group controlId="showAnswerCheckbox" className="m-0 d-inline-block" >
              <Form.Check type="checkbox" label="Show Answer" checked={!hideAns} onChange={handleChange} />
            </Form.Group>
            <Button variant="outline-primary" size='sm' className='ml-2' onClick={CopyToClipboard} >
              Copy to Clipboard
            </Button>
          </div>
          <div hidden={tab !== 'wq'}>*Click on a question to edit it</div>
        </div>

        <div id='results'>
          <div hidden={tab !== 'wq'} >
            {wq.map((data, i) => (
              <WQ data={data} hideAns={hideAns} index={i} key={i} />
            ))}
          </div>
          <div hidden={tab !== 'gq'} >
            {gq.map((data, i) => (
              <GQ data={data} hideAns={hideAns} index={i} key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;