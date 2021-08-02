import React from 'react';

import KeyboardReact from 'react-simple-keyboard';
import layout from 'simple-keyboard-layouts/build/layouts/french';
import 'react-simple-keyboard/build/css/index.css';
import { Drawer } from '@material-ui/core';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';

// const logger = new Logger();


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

const DEFAULT_DISPLAY = {
  '{bksp}': 'efface',
  '{enter}': '&lt; entrer',
  '{shift}': 'maj.',
  '{lock}': 'verr. maj.'
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
    this.initHandler = this.initHandler.bind(this);
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


  initHandler() {
    logger.info('Clavier KB init');

    const { inputVal, inputName, inputObject } = this.props;


    if (this.keyboard) logger.info(this.keyboard.getInput(inputName));

    if (this.keyboard && inputObject) {
      this.keyboard.replaceInput(inputObject);
    }

    if (this.keyboard) {
      this.keyboard.setInput(inputVal || '', inputName);
      this.keyboard.setOptions({carretPosition: (inputVal && inputVal.length) || 0});
    } else {
      logger.info('keyboard inconnu');
    }


  }


  render() {

    const { onChange, open, inputVal, inputName, defaultLayout, variant, className, baseClass} = this.props;
    const { layoutName } = this.state;

    const vvariant = variant || 'temporary';


    const vlayout = (defaultLayout && 'numeric'===defaultLayout) ? NUMERIC_LAYOUT : layout;
    const display_c = (defaultLayout && 'numeric'===defaultLayout) ? {'{bksp}': 'C'} : DEFAULT_DISPLAY;

    
    
    return(
      <Drawer anchor="bottom" open={open} variant={vvariant} className={ `Clavier ${(className?className:'')}`}>
        <KeyboardReact 
          layout={vlayout}
          baseClass={baseClass}
          layoutName={layoutName}
          inputName={inputName}
          mergeDisplay={true}
          display={display_c}
          disableCaretPositioning={true}
          onInit={this.initHandler}
          onChange={(input) => { logger.info(`[${inputVal}]`, input); onChange(input)}}
          onKeyPress={this.onKeyboardKeyPress}
          keyboardRef={ r=>{ if (this.keyboard==null) this.setRef(r)} }
          debug={true}
        />
      </Drawer>
    )
  }
}


export default Clavier;