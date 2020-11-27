import React from 'react';
import { useSelector } from 'react-redux';
import Main from './pages/Main'
import Select from './pages/Select'
import Results from './pages/Results'

function Content() {
  const page = useSelector(state => state.page);

  switch (page) {
    case 'home':
      return <Main />
    case 'select':
      return <Select />
    case 'results':
      return <Results />
    default:
      return <h1>404</h1>
  }
}

export default Content;