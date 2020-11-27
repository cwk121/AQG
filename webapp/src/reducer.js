const initialState = {
  apiDomain: '', // for npm run build
  // apiDomain: 'http://localhost:5000/', // for development
  error: '',
  page: 'home',
  loading: false,
  text: '',
  marked: '',
  submitted: false,
  gq: [],
  wq: []
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "ERROR":
      return { ...state, error: action.payload }
    case "PAGE":
      return { ...state, page: action.payload }
    case "LOADING":
      return { ...state, loading: action.payload }
    case "TEXT":
      return { ...state, text: action.payload }
    case "MARKED":
      return { ...state, marked: action.payload }
    case "SUBMITTED":
      return { ...state, submitted: action.payload }
    case "GQ":
      return { ...state, gq: action.payload }
    case "WQ":
      return { ...state, wq: action.payload }
    default:
      return state;
  }
}