// @flow
import { connect } from 'react-redux'
import Statistiques from '../components/Statistiques';


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StatistiquesCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Statistiques);

export default StatistiquesCont;