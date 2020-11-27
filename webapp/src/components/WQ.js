import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap'
import Highlighter from "react-highlight-words";
import ContentEditable from 'react-contenteditable'

function WQ(props) {
  const contentEditable = useRef();
  const wq = useSelector(state => state.wq);
  const dispatch = useDispatch();
  const data = props.data;
  const index = props.index;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function handleDelete() {
    let newWQ = wq.slice(0)
    newWQ.splice(index, 1)
    dispatch({ type: 'WQ', payload: newWQ })
  }

  function handleEdit(e) {
    let newWQ = wq.slice(0)
    newWQ[index].question = e.target.value;
    dispatch({ type: 'WQ', payload: newWQ })
  }

  return (
    <div className='p-2 mb-2'>
      <div>
        {index + 1}){" "}
        <ContentEditable
          innerRef={contentEditable}
          html={data.question} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={handleEdit} // handle innerHTML change
          tagName='span' // Use a custom HTML tag (uses a div by default)
        />
        <Button onClick={handleShow} variant="outline-info" size='sm' className='ml-2'>
          Source
        </Button>
        <Button onClick={handleDelete} variant="outline-danger" size='sm' className='ml-2'>
          Delete
        </Button>
      </div>
      <div hidden={props.hideAns}>
        <strong>Answer:</strong> {data.answer}
      </div>

      <Modal show={show} onHide={handleClose} size='lg' centered>
        <Modal.Header closeButton>
          {index + 1}) {data.question}
        </Modal.Header>
        <Modal.Body>
          <Highlighter
            highlightClassName='highlight'
            searchWords={[data.answer]}
            textToHighlight={data.context}
          />
        </Modal.Body>
      </Modal>

      <br />
    </div>
  )
}

export default WQ;