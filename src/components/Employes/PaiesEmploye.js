import React from 'react';


import { Modal, Fab, List, ListItem, Button } from '@material-ui/core';
import StdButton from '../common/StdButton';
import CloseIcon from '../common/icon/CloseIcon';

import LocalizedStrings from 'react-localization';
import {data} from '../../constants/translations';
let strings = new LocalizedStrings(data);


class PaiesEmploye extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    const { open, employe, pointages, initStartDate } = this.props;

    return (
    <Modal
      open={open}
      >
      <div className={ `Reglement ${contClass}`}>
        <div className="Modal-container">
          <div className="header">
            <div className="title">{ strings.modules. }</div>
          </div>
          <div className="body"></div>
          <div className="footer"></div>
        </div>
      </div>
    </Modal>
    );
  }

}