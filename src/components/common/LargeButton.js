import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@material-ui/core';

const LargeButton = React.forwardRef(({ identifier, elementclass, icon, text, disabled, onClick }, ref) => (
  <Button className={ `LargeButton ${elementclass}` } ref={ref} onClick={ () => onClick(identifier) } disabled={ disabled }>
    {icon &&
     <div className="LargeButton-icon">{ icon }</div>
    }
    <div className="LargeButton-text">{ text }</div>
  </Button>
));

LargeButton.propTypes = {
  identifier: PropTypes.string,
  elementclass: PropTypes.string,
  icon: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  handleClick: PropTypes.func
}

export default LargeButton;