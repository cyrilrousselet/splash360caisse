// @flow
import * as React from 'react';
import Footer from '../components/Footer';
import './../assets/scss/styles.scss'

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return <React.Fragment>{children}<Footer /></React.Fragment>;
  }
}
