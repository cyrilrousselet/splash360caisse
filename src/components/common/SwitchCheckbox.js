import React from 'react';
import PropTypes from 'prop-types';

const SwitchCheckbox = ({ name, isChecked, onChange, className, label, labelLeft, disabled, small }) => (
      <div className={ `switch-container${labelLeft ? ' labelleft' : ''}${small ? ' switch-small' : ''}${disabled ? ' switch-disabled' : ''}${className?' '+className:''}` }>
        <label>
          <input
            type="checkbox"
            className={ `${small ? 'switch switch-small' : 'switch'}` }
            id={`switchid-${name}`}
            name={name}
            checked={ isChecked }
            disabled={ disabled }
            onClick={ (e) => { e.stopPropagation(); } }
            onChange={ (event) => onChange(name, !isChecked) }
          />
          <div><div></div></div>
        </label>
        <label 
          htmlFor={`switchid-${name}`}
          onClick={(e) => { e.stopPropagation() }}>{ label }</label>
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