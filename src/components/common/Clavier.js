import React from 'react';

import KeyboardReact from 'react-simple-keyboard';
import layout from 'simple-keyboard-layouts/build/layouts/french';
import 'react-simple-keyboard/build/css/index.css';
import { Drawer } from '@material-ui/core';


const NUMERIC_LAYOUT = {
  'default': [
    '7 8 9',
    '4 5 6',
    '1 2 3',
    '{bksp} 0 .'
  ],
  'shift':[
  ]
};

class Clavier extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      layoutName: 'default'
    }

    this.keyboard = null;

    this.setRef = (element) => {
      this.keyboard = element;
    }

    this.onKeyboardKeyPress = this.onKeyboardKeyPress.bind(this);
    this.handleShift = this.handleShift.bind(this);
  }

  onKeyboardKeyPress(button) {

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();
  };

  handleShift() {
    const layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "default" ? "shift" : "default"
    });
  };



  render() {

    const { onChange, open, inputVal, inputName, defaultLayout, inputObject, variant, className, baseClass} = this.props;
    const { layoutName } = this.state;

    const _self = this;
    const vvariant = variant || 'temporary';

    if (this.keyboard) console.log(this.keyboard.getInput(inputName));

    const vlayout = (defaultLayout) ? ('numeric'===defaultLayout) ? NUMERIC_LAYOUT : layout : layout;
    const display_c = (defaultLayout && 'numeric'===defaultLayout) ? {'{bksp}': 'C'} : {};

    if (this.keyboard && inputObject) {
      this.keyboard.replaceInput(inputObject);
    }

    if (this.keyboard) {
      this.keyboard.setInput(inputVal, inputName);
      this.keyboard.setOptions({carretPosition: inputVal.length});
    } else {
      console.log('keyboard inconnu');
    }
    
    return(
      <Drawer anchor="bottom" open={open} variant={vvariant} className={ `Clavier ${(className?className:'')}`}>
        <KeyboardReact 
          layout={vlayout}
          baseClass={baseClass}
          layoutName={layoutName}
          display={display_c}
          inputName={inputName}
          disableCaretPositioning={true}
          onChange={(input) => { console.log(`[${inputVal}]`, input); onChange(input)}}
          onKeyPress={this.onKeyboardKeyPress}
          keyboardRef={ r=>{ if (this.keyboard==null) this.setRef(r)} }
          debug={true}
        />
      </Drawer>
    )
  }
}


export default Clavier;