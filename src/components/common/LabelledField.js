import React from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem } from '@material-ui/core';

class LabelledField extends React.Component {

  constructor(props) {
    super(props);
    this.state = { svalue: props.value || '', option: props.optionvalue };
    this.handleChange = this.handleChange.bind(this);
    this.optionChange = this.optionChange.bind(this);
  }

  handleChange = (e) => {
    this.setState({ svalue: e.target.value });
    this.props.onChange({ value: e.target.value, option: this.state.option });
  }
  
  optionChange(e) {
    this.setState({ option: e.target.value });
    this.props.onChange({ value: this.state.svalue, option: e.target.value });
  }

  render() {

    const { name, className, placeholder, type, readOnly, label, options, postvalue, disabled, maxLength, value } = this.props;
    const { svalue, option } = this.state;
    const withoptionsclass = (options && options.length>0) ? ' with-options' : '';
    const withpostvalue = postvalue ? ' with-postvalue' : '';
    const disabledvalue = disabled ? ' disabled' : '';

    const val = value || svalue;

    // (options && options.length>0) && console.log(value+' :: option: '+option);

    return (
      <div className={`labelledfield labelledfield-container ${className?className:''}${withoptionsclass}${withpostvalue}${disabledvalue}`}>
          <label htmlFor={`fieldid-${name}`}>{ label }</label>
          <div className="input-wrapper">
            <input
              type={type}
              className="labelledfield-field"
              id={`fieldid-${name}`}
              name={name}
              value={val}
              readOnly={ readOnly }
              onChange={ this.handleChange }
              placeholder={placeholder}
              size={maxLength}
              />
            { postvalue && <div className="postvalue">{postvalue}</div> }
            { (options && options.length>0) && 
            <Select
            disableUnderline
              value={option}
              onChange={this.optionChange}
            >
              { options.map((opt,i)=>(
                <MenuItem value={opt} key={i}>{opt}</MenuItem>
              ))}
            </Select>
            }
          </div>
      </div>
    );
  } 
}

LabelledField.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  // value: PropTypes.oneOf([
  //   PropTypes.string, 
  //   PropTypes.number
  // ]).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  type: PropTypes.oneOf([
    'text',
    'password',
    'number'
  ]).isRequired,
  label: PropTypes.string,
  options: PropTypes.array,
  optionvalue: PropTypes.string,
  postvalue: PropTypes.string
}

export default LabelledField;