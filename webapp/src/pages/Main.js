import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormControl, Button } from 'react-bootstrap'

function Main() {
  const apiDomain = useSelector(state => state.apiDomain);
  const text = useSelector(state => state.text);
  const dispatch = useDispatch();

  function handleChange(e) {
    dispatch({ type: 'TEXT', payload: e.target.value })
  }
  function handleProceed() {
    if (text === '') return;
    let formData = new FormData();
    formData.append('context', text);

    dispatch({ type: 'LOADING', payload: true })
    fetch(apiDomain + '/mark', {
      body: formData,
      method: 'POST'
    }).then(response => {
      return response.text();
    }).then(data => {
      dispatch({ type: 'MARKED', payload: data })
      dispatch({ type: 'PAGE', payload: 'select' })
    }).catch(error => {
      dispatch({ type: 'ERROR', payload: error.message })
    }).finally(() => {
      dispatch({ type: 'LOADING', payload: false })
    });
  }
  function sample() {
    dispatch({
      type: 'TEXT', payload:
        `The OUHK is a pioneer of open and distance education. Established by the Government in 1989 as The Open Learning Institute of Hong Kong (OLI), we have striven to achieve our mission of “Education for All”, making quality and flexible further education opportunities available to working adults. After years of steady development, the OUHK attained university title in May 1997, which is a testament to the wide recognition of our academic accomplishments and contributions to higher education.`
    })
  }

  return (
    <div>
      <FormControl
        as="textarea"
        rows='20'
        onChange={handleChange}
        value={text}
        className='mb-2' />

      <div className="mb-2 clearfix">
        <Button variant="primary" className='float-right ml-3'
          onClick={handleProceed}>
          Proceed
        </Button>
        <Button variant="info" className='float-right'
          onClick={sample}>
          Sample Text
        </Button>
      </div>
    </div>
  );
}

export default Main;