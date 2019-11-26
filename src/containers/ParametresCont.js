// @flow
import { connect } from 'react-redux'
import Parametres from '../components/Parametres';
import history from './../helpers/history';
import paths from './../constants/routes.json';


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClickSubModule: text => history.push(paths[text])
  }
}

const ParametresCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Parametres);

export default ParametresCont;