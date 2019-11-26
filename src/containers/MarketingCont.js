// @flow
import { connect } from 'react-redux'
import Marketing from '../components/Marketing';
import history from '../helpers/history';
import paths from './../constants/routes.json';


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClickSubModule: text => history.push(paths[text])
  }
}

const MarketingCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Marketing);

export default MarketingCont;