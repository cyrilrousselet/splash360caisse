// @flow
import { connect } from 'react-redux'
import ClotureHome from '../components/Cloture';


const getSubModulesFromDroits = (droits) => {

  let __d = [];
  if (droits.tresor) {
    __d.push('tresor');
  }
  if (droits.cloture) {
    __d.push('cloture');
  }

  console.log('ClotureHomeCont', __d);

  return __d;
}

const mapStateToProps = (state) => {
  return {
  //  pointages: getPointages(state),
    submodules: getSubModulesFromDroits(state.authentication.user.droits),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const ClotureHomeCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(ClotureHome);

export default ClotureHomeCont;