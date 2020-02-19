import React from 'react';
import PropTypes from 'prop-types';

const SwitchCheckbox = ({ name, isChecked, onChange, className, label, labelLeft, small }) => (
      <div className={ `switch-container${labelLeft ? ' labelleft' : ''}${small ? ' switch-small' : ''}${className?' '+className:''}` }>
        <label>
          <input
            type="checkbox"
            className={ `${small ? 'switch switch-small' : 'switch'}` }
            id={`switchid-${name}`}
            name={name}
            defaultChecked={ isChecked }
            onChange={ (event) => onChange(name, !isChecked) }
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
  labelLeft: PropTypes.bool,
  small: PropTypes.bool,
}

export default SwitchCheckbox;