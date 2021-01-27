import React from 'react';
import PropTypes from 'prop-types';
import PillButton from '../common/PillButton';
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from './icon/CloseIcon';

class NumberKeyboard extends React.Component {


  render() {

    const { 
      buttonHandler, 
      closeHandler, 
      open, 
      disabled,
      numbersOnly, 
      inner, 
      keyboardOnly,
      className,
      extraButton,
    } = this.props;

    const boutons = [1,2,3,4,5,6,7,8,9,',','0','c'];
    if (numbersOnly) boutons.splice(9,1,'');

    if (extraButton) {
      if (extraButton.position!==null) {
        boutons.splice(extraButton.position,extraButton.replace?1:0,extraButton);
      } else {
        boutons.push(extraButton);
      }
    }


    const __content = 
        <div className="keyboard">
            { boutons.map((btn, i) => {
            return ((btn!==undefined && btn!=='')
                ? (
                (typeof btn === "object") 
                  ? <PillButton elementclass="btn" text={ `${btn.text}` } key={ i } onClick={ (text) => { if (!disabled) { btn.handler(text) }} } />
                  : <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ (text) => { if (!disabled) { buttonHandler(text) }} } />
                )
                : <div className="empty" key={ i }></div>
                );
            })}
        </div>;


    if (inner) {
      return (
        <div className={ `NumberKeyboardContainer${(open ? ' visible' : '')}${(keyboardOnly ? ' keyboard-only' : '')} ${(className ? className : '' )} ${disabled ? 'disabled' : ''}` }>
          <div className="NumberKeyboard">
            <div className="inner-container">{ __content }</div>
            {!keyboardOnly && (<Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
              <CloseIcon />
            </Fab>)}
          </div>
        </div>
      );
    } else {  
      return (
        <Modal open={ open }>
          <div className="NumberKeyboard">
            <div className="Modal-container">{ __content }</div>
            <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
              <CloseIcon />
            </Fab>
          </div>
        </Modal>
      );
    }
  }

}

export default NumberKeyboard;

NumberKeyboard.propTypes = {
  open: PropTypes.bool.isRequired,
  numbersOnly: PropTypes.bool,
  buttonHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func
}