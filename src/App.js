import React from 'react'
import './App.css'

import { invoke } from '@tauri-apps/api/tauri'  

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabTop: 15, // tab top px
      visibleTab: "embed", // yeah
      embedInput: "", // embed input textarea text
      embedHiddenInput: "", // embed hidden msg
      embedOutput: "", // embed output textarea text
      password: "example",
    };
  }

  changeTab(event, arg) {
    switch(arg) {
      case "embed":
        this.setState({tabTop: 15, visibleTab: arg});
        break;
      case "extract":
        this.setState({tabTop: 15 + 70, visibleTab: arg});
        break;
      case "passwords":
        this.setState({tabTop: 15 + 140, visibleTab: arg});
        break;
      case "help":
        this.setState({tabTop: 15 + 210, visibleTab: arg});
        break;
    }
  }

  copy(text) {
    invoke('copy_text', {'text': text})
      .then((message) => {})
      .catch((error) => {})
  }

  pasteInto(into) {
    invoke('paste')
      .then((message) => {
        switch (into) {
          case "embed":
            this.setState({embedInput: message});
          case "embedHiddenInput":
            this.setState({embedHiddenInput: message});
        }
      })
      .catch((err) => {console.log("nooo");})
  }

  embed(inp) {
    invoke('embed', {
      input: inp,
      msg: this.state.embedHiddenInput,
      password: this.state.password,
    })
      .then((resp) => {
        this.setState({
          embedOutput: resp
        })
      })
      .catch((err) => {
        console.log(err);
      })
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

            {
              this.state.visibleTab == "embed"
                ? <div className="content">
                    <h1>Embed messages</h1>
                    <h4>Input message:</h4>
                    <textarea
                      placeholder="Regular message here.." 
                      value={this.state.embedInput}
                      onChange={(e) => {this.setState({embedInput: e.target.value})}}
                    />
                    <button 
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedInput)}}
                    >Copy</button>
                    <button 
                      className="textareaButton right"
                      onClick={(e) => {this.setState({
                        embedInput: this.pasteInto('embed')
                      })}}
                    >Paste</button>

                    <h4>Hidden msg:</h4>
                    <textarea
                      placeholder="Enter your hidden message here" 
                      value={this.state.embedHiddenInput}
                      onChange={(e) => {this.setState({embedHiddenInput: e.target.value})}}
                    />
                    <button 
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedHiddenInput)}}
                    >Copy</button>
                    <button 
                      className="textareaButton right"
                      onClick={(e) => {this.setState({
                        embedHiddenInput: this.pasteInto('embedHiddenInput')
                      })}}
                    >Paste</button>
                  
                    <h4>Output:</h4>
                    <textarea readOnly
                      placeholder="When you convert your message, it'll appear here." 
                      value={this.state.embedOutput}
                      onChange={(e) => {}}
                    />
                    
                    <button 
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedOutput)}}
                    >Copy</button>
                    <button 
                      className="textareaButton right"
                      onClick={(e) => {this.setState({embedOutput: ""})}}
                    >Clear</button>
                    <br/><br/>
                    <div class="buttonCenter">
                      <button 
                        class="action"
                        onClick={(e) => this.embed(this.state.embedInput)}
                      >Convert</button>
                    </div>
                    <div className="tip info moveDown">Use the password tab to further secure your messages.</div>
                  
                  </div>
                : null
            }
            
          </div> 
        </header>
      </div>
    );
  }
}

export default App
