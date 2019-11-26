import React from 'react';
import PropTypes from 'prop-types';

const SwitchCheckbox = ({ name, isChecked, onChange, label }) => (
      <div className="switch-container">
        <label>
          <input
            type="checkbox"
            className="switch"
            id={`switchid-${name}`}
            name={name}
            defaultChecked={ isChecked }
            onChange={ () => onChange(name, isChecked) }
          />
          <div><div></div></div>
        </label>
        <label htmlFor={`switchid-${name}`}>{ label }</label>
      </div>
    );

SwitchCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
}

export default SwitchCheckbox;