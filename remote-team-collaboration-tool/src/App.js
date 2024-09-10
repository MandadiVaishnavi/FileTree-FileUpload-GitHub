import React from 'react';
import FileTree from './Components/FileTree';
import FileUpload from './Components/FileUpload';

function App() {
  return (
    <div className="App">
      <h1>GitHub File Tree</h1>
      <FileTree owner="MandadiVaishnavi" repo="My_Shopping_App" branch="main" />
      <FileUpload owner="MandadiVaishnavi" repo="My_Shopping_App" branch="main" />
    </div>
  );
}

export default App;
