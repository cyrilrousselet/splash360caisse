import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@material-ui/core';

const StdButton = ({ identifier, elementclass, icon, noStroke, text, disabled, onClick }) => (
  <Button className={ `StdButton ${elementclass} ${noStroke && 'no-stroke'}` } onClick={ () => onClick(identifier) } disabled={ disabled }>
    {icon &&
     <div className="StdButton-icon">{ icon }</div>
    }
    {text &&
      <div className="StdButton-text">{ text }</div>
    }
  </Button>
);

StdButton.propTypes = {
  identifier: PropTypes.string,
  elementclass: PropTypes.string,
  icon: PropTypes.node,
  text: PropTypes.string.isRequired,
  noStroke: PropTypes.bool,
  disabled: PropTypes.bool,
  handleClick: PropTypes.func
}

export default StdButton;