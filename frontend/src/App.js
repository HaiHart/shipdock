import React, {useState} from 'react';
import logo from './logo.png';
import './App.css';
import HelloWorld from './components/HelloWorld';
import * as Wails from '@wailsapp/runtime'
import { Helmet } from "react-helmet";

function App() {
	const [result, setResult] = useState(null);
	
  Wails.Events.On("Count",result =>{
    setResult(result)
  })  

  return (
    <div id="app" className="App">
      <Helmet>
        <title>
          Test run app
        </title>
      </Helmet>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome to your new <code>{result}</code> project.
        </p>

        <HelloWorld />
      </header>
    </div>
  );
}

export default App;
