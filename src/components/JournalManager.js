import React from 'react';


class JournalManager extends React.Component {


  componentDidUpdate() {
    const { spool, write } = this.props;
    if (spool && spool.length>0) {
      write(spool[0]);
    }
  }

  render() {
    return (
      <div className='JournalManager'>.</div>
    )
  }

}

export default JournalManager;