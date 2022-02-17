// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import JournalManager from '../components/JournalManager';
import { journalActions } from '../services/journal/journalActions';

const mapStateToProps = (state) => {
  return {
    spool: state.journalReducer.spool
  }
}

const mapDispatchToProps = (dispatch) => {
  const bound = bindActionCreators({
    write: journalActions.write
  }, dispatch);

  return {
    ...bound
  }
}

const JournalManagerCont = connect(
  mapStateToProps,
  mapDispatchToProps
)(JournalManager);

export default JournalManagerCont;