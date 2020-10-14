import React from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem } from '@material-ui/core';

class LabelledField extends React.Component {

  constructor(props) {
    super(props);
    this.state = { svalue: props.value || '', soption: props.optionvalue };
    this.handleChange = this.handleChange.bind(this);
    this.optionChange = this.optionChange.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(event) {
    const {option} = this.props;
    const {soption} = this.state;
    this.setState({ svalue: event.target.value });
    this.props.onChange({ value: event.target.value, option: soption || option });
  }

  handleKeyup(event) {
    if (event.keyCode===13) {
      this.props.onSubmit(this.props.name, event.target.value);
    }
  }
  
  optionChange(event) {
    const {value} = this.props;
    const {svalue} = this.state;
    this.setState({ option: event.target.value });
    this.props.onChange({ value: svalue||value, option: event.target.value });
  }

  handleClick(event) {
    const {name, value} = this.props;
    const {svalue} = this.state;
    if (this.props.onClick) this.props.onClick(event, {name:name, value: svalue||value});
  }

  render() {

    const { name, className, placeholder, type, readOnly, label, options, option, postvalue, disabled, maxLength, value } = this.props;
    const { svalue, soption } = this.state;
    const withoptionsclass = (options && options.length>0) ? ' with-options' : '';
    const withpostvalue = postvalue ? ' with-postvalue' : '';
    const disabledvalue = disabled ? ' disabled' : '';

    const val = svalue || value;
    const voption = soption || option;

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
              onKeyUp={ this.handleKeyup }
              onClick={ this.handleClick }
              placeholder={placeholder}
              size={maxLength}
              />
            { postvalue && <div className="postvalue">{postvalue}</div> }
            { (options && options.length>0) && 
            <Select
            disableUnderline
              value={voption}
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
  onChange: PropTypes.func,
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