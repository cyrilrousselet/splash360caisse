import React from 'react';
import PropTypes from 'prop-types';

const NavigationButton = ({ identifier, elementclass, icon, text, onClick }) => (
  <button className={ `NavigationButton ${elementclass}` } onClick={ () => onClick(identifier) }>
    <div className="text">{ text }</div>
  </button>
);

NavigationButton.propTypes = {
  identifier: PropTypes.string,
  elementclass: PropTypes.string,
  text: PropTypes.string.isRequired,
  handleClick: PropTypes.func
}

export default NavigationButton;