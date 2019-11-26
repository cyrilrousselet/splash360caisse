import React from 'react';
import PropTypes from 'prop-types';

const PillButton = ({ elementclass, text, onClick }) => (
  <button className={ `PillButton ${elementclass}` } onClick={ () => onClick(text) }>
    <div className="PillButton-text">{ text }</div>
  </button>
);

PillButton.propTypes = {
  elementclass: PropTypes.string,
  text: PropTypes.string.isRequired,
  handleClick: PropTypes.func
}

export default PillButton;