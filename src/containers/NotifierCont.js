import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import Notifier from '../components/Notifier';
import { notificationActions } from './../services/notification/notificationActions';


const mapStateToProps = (state) => {
  return {
    stack: state.notificationReducer.stack
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    acceptOrder: notificationActions.acceptOrder,
    denyOrder: notificationActions.denyOrder
  },dispatch);
}

const NotifierCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifier);

export default NotifierCont;