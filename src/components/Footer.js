import React from 'react';
import LocalizedStrings from 'react-localization';
import { data } from '../constants/translations';
import LogoutIcon from './common/icon/LogoutIcon';

let strings = new LocalizedStrings(data);


class Footer extends React.Component {

    state = { status: 'off', heure: '', date: '' };

    constructor(props) {
        super(props);
        this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidMount() {
        this.intervalID = setInterval(
            () => this.tick(),
            1000
        );
        window.addEventListener('online', this.updateStatus);
        window.addEventListener('offline', this.updateStatus);

        this.updateStatus();
    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
        window.removeEventListener('online', this.updateStatus);
        window.removeEventListener('offline', this.updateStatus);
    }

    getContent() {
        let dt = new Date();
        return {
            heure: dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0'),
            date: strings.general.jours[dt.getDay()] + ' ' + dt.getDate() + ' ' + strings.general.mois[dt.getMonth()]
        }
    }
    updateStatus() {
        this.setState({ status: navigator.onLine ? 'on' : 'off' });
    }

    tick() {
        this.setState(this.getContent());
    }

    render() {

        const { userLogout } = this.props;

        return (
          <div className="Footer">
            <div className={ `connexion ${this.state.status}` }>
              <span>{ this.state.status === 'on' ? strings.footer.online : strings.footer.offline }</span>
            </div >
            <div className="right">
              <div className="date">{ this.state.date }</div>
              <div className="heure">{ this.state.heure }</div>
              <div className="logout">
                  <LogoutIcon onClick={userLogout} />
              </div>
            </div>
          </div>
        );
    }
}

export default Footer;