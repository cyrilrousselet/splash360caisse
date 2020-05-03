import React from 'react';
// import PropTypes from 'prop-types';

// import LocalizedStrings from 'react-localization';
// import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';

// let strings = new LocalizedStrings(data);

class Depenses extends React.Component {

  constructor(props) {
    super(props);
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

 componentWillMount() {
  // const { getAllActive } = this.props;
  // getAllActive();
 }

 shouldComponentRender() {
 //  const {loading} = this.props;
 //  if(loading===false) return false;
   return true;
 }

 render() {

 // const { catalogue, error, loading } = this.props;

  if(!this.shouldComponentRender()) {
    return <LoadingSpinner />
  }

  return (
    <div className="Depenses container">
      <TopZone />
      <div className="MainZone">
          <div className="tempcont">Depenses</div>
      </div>
    </div>
    );
  }
}
export default Depenses;

// Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
// }