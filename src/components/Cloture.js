import React from 'react';
import PropTypes from 'prop-types';

// import LocalizedStrings from 'react-localization';
// import {data} from '../constants/translations';
import TopZone from '../containers/TopZone';
import LoadingSpinner from './common/LoadingSpinner';

import contimage from '../assets/images/fake_contenu_cloture.svg';

// let strings = new LocalizedStrings(data);

class Cloture extends React.Component {

  constructor(props) {
    super(props);
    this.shouldComponentRender = this.shouldComponentRender.bind(this);
  }

 componentDidMount() {
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
    <div className="Cloture container">
      <TopZone />
      <div className="MainZone">
        <img src={ contimage } className="contimage" />
      </div>
    </div>
    );
  }
}
export default Cloture;

Cloture.propTypes = {
//   catalogue: PropTypes.array,
//   loading: PropTypes.bool,
//   error: PropTypes.string,
//   getAllActive: PropTypes.func
}