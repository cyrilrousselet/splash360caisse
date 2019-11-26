// @flow
import { connect } from 'react-redux'
import Stocks from '../components/Stocks';


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StocksCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Stocks);

export default StocksCont;