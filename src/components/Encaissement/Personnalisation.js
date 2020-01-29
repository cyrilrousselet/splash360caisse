import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);

class Personnalisation extends React.Component {


  render() {
    
    const { open, closePersonnalisation, contClass } = this.props;

    return (
      <Modal
        open={open}
        >
        <div className={ `Personnalisation ${contClass}`}>
          <div className="Modal-container">
            <div className="header">
              <div className="title">{ strings.modules.encaissement.personnalisation.titre }</div>
            </div>
            <div className="body">

            </div>
            <div className="footer">

            </div>
          </div>
        </div>
      </Modal>
    );

  }

}

export default Personnalisation;

Personnalisation.propTypes = {
  open: PropTypes.bool,
  closePersonnalisation: PropTypes.func.isRequired,
}