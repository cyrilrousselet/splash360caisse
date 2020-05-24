import React from 'react';
import PropTypes from 'prop-types';

const PillButton = ({ elementclass, text, onClick }) => (
  <button className={ `PillButton ${elementclass}` } onClick={ (e) => onClick(text,e) }>
    <div className="PillButton-text">{ text }</div>
  </button>
);

PillButton.propTypes = {
  elementclass: PropTypes.string,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

export default PillButton;