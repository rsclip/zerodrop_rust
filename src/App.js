import React from 'react'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabTop: 15,
    };
  }

  changeTab(event, arg) {
    switch(arg) {
      case "embed":
        this.setState({tabTop: 15});
        break;
      case "extract":
        this.setState({tabTop: 15 + 70});
        break;
      case "passwords":
        this.setState({tabTop: 15 + 140});
        break;
      case "help":
        this.setState({tabTop: 15 + 210});
        break;
    }
    
    console.log("changed tab", arg, this.state.tabTop);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="frames">
            <div className="nav noselect">
              <h2>ZeroDrop</h2>
              <div className="items">
                <h3 onClick={(e) => {
                  this.changeTab(e, 'embed')
                }}>embed</h3>
  
                <h3 onClick={(e) => {
                  this.changeTab(e, 'extract')
                }}>extract</h3>
  
                <h3 onClick={(e) => {
                  this.changeTab(e, 'passwords')
                }}>passwords</h3>
  
                <h3 onClick={(e) => {
                  this.changeTab(e, 'help')
                }}>help</h3>
  
                <div 
                  id="selector" 
                  className="arrow-left tabSelector"
                  style={{top: this.state.tabTop}}></div>
              </div>
            </div>
          </div> 
        </header>
      </div>
    );
  }
}

export default App
