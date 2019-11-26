import { connect } from 'react-redux'
import Cloture from '../components/Cloture';

// import {data} from '../constants/translations';
// import LocalizedStrings from 'react-localization';
// let strings = new LocalizedStrings(data);


const mapStateToProps = (state) => {
  return {};
}

const mapDispatchToProps = (dispatch) => {
  return {};
}

const ClotureCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Cloture);

export default ClotureCont;