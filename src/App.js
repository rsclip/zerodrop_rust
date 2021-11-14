import React from 'react'
import './App.css'
import AWN from "awesome-notifications"
import { invoke } from '@tauri-apps/api/tauri'  

// global options
let globalOptions = {
  position: "bottom-left",
};

// Initialize instance of AWN
let notifier = new AWN(globalOptions)

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabTop: 15, // tab top px
      visibleTab: "embed", // yeah
      embedInput: "", // embed input textarea text
      embedHiddenInput: "", // embed hidden msg
      embedOutput: "", // embed output textarea text
      password: "examplePw",
      extractInput: "",
      extractOutput: "",
    };
  }

  changeTab(event, arg) {
    notifier.success("pp");
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
            break;
          case "embedHiddenInput":
            this.setState({embedHiddenInput: message});
            break;
          case "extractInput":
            this.setState({extractInput: message});
            break;
        }
      })
      .catch((err) => {console.log("nooo");})

      console.log(this.state);
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

  extract(inp) {
    invoke('extract', {
      input: inp,
      password: this.state.password,
    })
      .then((resp) => {
        this.setState({
          extractOutput: resp
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
  
                <div 
                  id="selector" 
                  className="arrow-left tabSelector"
                  style={{top: this.state.tabTop}}></div>
              </div>
              <h4 onClick={(e) => {
                  window.open("https://github.com/Cyclip/zerodrop_rust");
                }}>Github Repo 🔗</h4>
            </div>

            {
              this.state.visibleTab == "embed"
                ? <div className="content">
                    <h1>Embed messages</h1>
                    <h4>Input message</h4>
                    <textarea
                      id="embedInput"
                      placeholder="Regular message here.." 
                      value={this.state.embedInput}
                      onChange={(e) => {this.setState({embedInput: e.target.value})}}
                    />
                    <button 
                      id="embedInputCopy"
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedInput)}}
                    >Copy</button>
                    <button 
                      id="embedInputPaste"
                      className="textareaButton right"
                      onClick={(e) => {this.setState({
                        embedInput: this.pasteInto('embed')
                      })}}
                    >Paste</button>

                    <h4>Hidden message</h4>
                    <textarea
                      id="embedHidden"
                      placeholder="Enter your hidden message here" 
                      value={this.state.embedHiddenInput}
                      onChange={(e) => {this.setState({embedHiddenInput: e.target.value})}}
                    />
                    <button 
                      id="embedHiddenCopy"
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedHiddenInput)}}
                    >Copy</button>
                    <button 
                      id="embedHiddenPaste"
                      className="textareaButton right"
                      onClick={(e) => {this.pasteInto('embedHiddenInput')}}
                    >Paste</button>
                  
                    <h4>Output</h4>
                    <textarea readOnly
                      id="embedOutput"
                      placeholder="When you convert your message, it'll appear here." 
                      value={this.state.embedOutput}
                      onChange={(e) => {}}
                    />
                    
                    <button 
                      id="embedOutputCopy"
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.embedOutput)}}
                    >Copy</button>
                    <button 
                      id="embedOutputClear"
                      className="textareaButton right"
                      onClick={(e) => {this.setState({embedOutput: ""})}}
                    >Clear</button>
                    <div className="buttonCenter">
                      <button 
                        className="action"
                        onClick={(e) => this.embed(this.state.embedInput)}
                      >Embed</button>
                    </div>
                    <br/>
                    <div className="tip info moveDown">Use the password tab to further secure your messages.</div>
                  
                  </div>
                : null
            }

            {
              this.state.visibleTab == "extract"
                ? <div className="content">
                    <h1>Extract messages</h1>
                    <h4>Message</h4>
                    <textarea
                      id="extractInput"
                      placeholder="Message containing hidden message here" 
                      value={this.state.extractInput}
                      onChange={(e) => {this.setState({extractInput: e.target.value})}}
                    />
                    <button 
                      id="extractInputCopy"
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.extractInput)}}
                    >Copy</button>
                    <button 
                      id="extractInputPaste"
                      className="textareaButton right"
                      onClick={(e) => {this.pasteInto('extractInput')}}
                    >Paste</button>
                    
                    <div className="buttonCenter">
                      <button 
                        className="action"
                        onClick={(e) => this.extract(this.state.extractInput)}
                      >Extract</button>
                    </div>

                    <br/><br/>

                    <h4>Hidden message</h4>
                    <textarea readOnly
                      id="extractOutput"
                      placeholder="Your hidden message will appear here." 
                      value={this.state.extractOutput}
                      onChange={(e) => {}}
                    />
                    
                    <button 
                      id="extractOutputCopy"
                      className="textareaButton left"
                      onClick={(e) => {this.copy(this.state.extractOutput)}}
                    >Copy</button>
                    <button 
                      id="extractOutputClear"
                      className="textareaButton right"
                      onClick={(e) => {this.setState({extractOutput: ""})}}
                    >Clear</button>

                    <div className="tip info moveDown">The message will be extracted via the password in the passwords tab.</div>

                  </div>
                : null
            }

            {
              this.state.visibleTab == "passwords"
                ? <div className="content">
                    <h1>Passwords</h1>
                    <h4>Password</h4>
                    <input
                      type="password"
                      placeholder="Password"
                      maxLength="32"
                      value={this.state.password}
                      onChange={(e) => {
                        const { value, maxLength } = e.target;
                        this.setState({password: value.slice(0, maxLength)});
                      }}></input>

                    <h3>test</h3>

                    <div className="tip warning">This password is required for extracting messages. Without the correct password, your hidden message will be unrecoverable.</div>

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
