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
      numbersOnly, 
      inner, 
      keyboardOnly 
    } = this.props;

    const boutons = [1,2,3,4,5,6,7,8,9,',','0','c'];
    if (numbersOnly) boutons.splice(9,1,'');


    const __content = 
        <div className="keyboard">
            { boutons.map((btn, i) => {
            return ((btn!==undefined && btn!=='')
                ? <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ buttonHandler } />
                : <div className="empty" key={ i }></div>
                );
            })}
        </div>;


    if (inner) {
      return (
        <div className={ `NumberKeyboardContainer${(open ? ' visible' : '')}${(keyboardOnly ? ' keyboard-only' : '')}` }>
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