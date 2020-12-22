import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PillField extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: (props.value!==undefined) ? props.value : ''
    };
  }

  componentWillReceiveProps({value}) {
    this.setState({value:value});
  }

  render() {
    const { value } = this.state;
    let placeholder = '';
    if (this.props.charNum) {
      placeholder = Array((this.props.charNum - value.length )+1).join('_');
    }
 
    return(
      <div className={ `PillField ${this.props.className}` }>
        { this.props.charNum && (<div className="placeholder num" data-num={this.props.charNum}>{ placeholder }</div> ) }
        { !this.props.static && (<input type={ this.props.type } value={ this.props.value } readOnly /> )}
        { this.props.static && (<div className="field">{ this.props.value }</div> )}
        <div className={ `innerButton btn-${this.props.innerButton}` } onClick={() => { this.props.innerButtonHandler() }}></div>
      </div>
    );
  }

}


PillField.propTypes = {
  charNum: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool
  ]),
  value: PropTypes.string,
  innerButtonHandler: PropTypes.func,
  type: PropTypes.oneOf([
    'text',
    'password',
    'number'
  ]).isRequired,
  decimal: PropTypes.number,
  innerButton: PropTypes.oneOf([
    'delete',
    'submit',
    'keyboard',
    'none'
  ]).isRequired
}
export default PillField;