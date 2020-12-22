import React from 'react';
import PropTypes from 'prop-types';
import PillField from '../common/PillField';
import PillButton from '../common/PillButton';

class Calculette extends React.Component {


  render() {

    const { total, buttonHandler, deleteHandler } = this.props;

    const boutons = [7,8,9,4,5,6,1,2,3,'0','00','c'];

    return (
      <div className="Calculette">
        <PillField type="text" innerButton="delete" static={ true } charNum={ false } decimal={ 2 } value={ total.toFixed(2).replace('.',',') } innerButtonHandler={deleteHandler} />
        {/* <PillField type="text" innerButton="delete" charNum={ false } decimal={ 2 } value={ total } innerButtonHandler={deleteHandler} /> */}
        <div className="keyboard">
            { boutons.map((btn, i) => {
            return (btn!==undefined
                ? <PillButton elementclass="btn" text={ `${btn}` } key={ i } onClick={ buttonHandler } />
                : <div className="empty" key={ i }></div>
                );
            })}
        </div> 

      </div>
    );
  }

}

export default Calculette;

Calculette.propTypes = {
  total: PropTypes.number,
  buttonHandler: PropTypes.func.isRequired,
  deleteHandler: PropTypes.func.isRequired,
}