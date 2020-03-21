import React from 'react';
import PropTypes from 'prop-types';
import PillField from '../common/PillField';
import PillButton from '../common/PillButton';
import { Modal, Fab } from '@material-ui/core';
import CloseIcon from './icon/CloseIcon';

class NumberKeyboard extends React.Component {


  render() {

    const { buttonHandler, closeHandler, open, numbersOnly } = this.props;

    const boutons = [1,2,3,4,5,6,7,8,9,',','0','c'];
    if (numbersOnly) boutons.splice(9,1,'');

    return (
      <Modal
        open={ open }
        >
        <div className="NumberKeyboard">
          <div className="Modal-container">
        {/* <PillField type="text" innerButton="delete" charNum={ false } decimal={ 2 } value={ total.toFixed(2).replace('.',',') } innerButtonHandler={deleteHandler} /> */}
            <div className="keyboard">
                { boutons.map((btn, i) => {
                  console.log('btn '+btn, btn!=='');
                return ((btn!==undefined && btn!=='')
                    ? <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ buttonHandler } />
                    : <div className="empty" key={ i }></div>
                    );
                })}
            </div> 
          </div>
          <Fab aria-label="close" size="small" className="close-button" onClick={ closeHandler }>
            <CloseIcon />
          </Fab>
        </div>
      </Modal>
    );
  }

}

export default NumberKeyboard;

NumberKeyboard.propTypes = {
  open: PropTypes.bool.isRequired,
  numbersOnly: PropTypes.bool,
  buttonHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired
}