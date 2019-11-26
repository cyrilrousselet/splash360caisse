import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@material-ui/core';

const StdButton = ({ identifier, elementclass, icon, text, disabled, onClick }) => (
  <Button className={ `StdButton ${elementclass}` } onClick={ () => onClick(identifier) } disabled={ disabled }>
    {icon &&
     <div className="StdButton-icon">{ icon }</div>
    }
    <div className="StdButton-text">{ text }</div>
  </Button>
);

StdButton.propTypes = {
  identifier: PropTypes.string,
  elementclass: PropTypes.string,
  icon: PropTypes.node,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  handleClick: PropTypes.func
}

export default StdButton;