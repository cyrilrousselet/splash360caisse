// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Avoirs from '../components/Marketing/Avoirs';
import history from '../helpers/history';
import paths from './../constants/routes.json';
import { marketingActions } from './../services/marketing/marketingActions';


const mapStateToProps = (state) => {
  return {
    avoirs: state.marketingReducer.avoirs
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    getAvoirsList: marketingActions.getAvoirsList
  }, dispatch);
  return {
    ...bound
  };
}

const MarketingAvoirsCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Avoirs);

export default MarketingAvoirsCont;