// @flow
import * as React from 'react';
import FooterCont from '../containers/FooterCont';
import NotifierCont from '../containers/NotifierCont';
import './../assets/scss/styles.scss'

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        {children}
        <FooterCont />
        <NotifierCont />
      </React.Fragment>
    );
  }
}

