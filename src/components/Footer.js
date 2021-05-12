import React from 'react';
import LocalizedStrings from 'react-localization';
import { data } from '../constants/translations';
import packageJson from './../../package.json';
import {Detector} from 'react-detect-offline'
import moment from 'moment';
import frLocale from "moment/locale/fr";


let strings = new LocalizedStrings(data);


class Footer extends React.Component {

    // state = { status: 'off', heure: '', date: '' };

    constructor(props) {
        super(props);
        this.state = {
            heure: '',
            date: ''
        };
        // this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidMount() {
        this.intervalID = setInterval(
            () => this.tick(),
            1000
        );
        // window.addEventListener('online', this.updateStatus);
        // window.addEventListener('offline', this.updateStatus);

        // this.updateStatus();
    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
        // window.removeEventListener('online', this.updateStatus);
        // window.removeEventListener('offline', this.updateStatus);
    }

    getContent() {
        let dt = new Date();
        return {
            heure: dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0'),
            date: strings.general.jours[dt.getDay()] + ' ' + dt.getDate() + ' ' + strings.general.mois[dt.getMonth()]
        }
    }
    // updateStatus() {
    //     this.setState({ status: navigator.onLine ? 'on' : 'off' });
    // }

    tick() {
        this.setState(this.getContent());
    }

    render() {

        const {online, status, expiredate} = this.props;

        const expDate = moment(expiredate).locale('fr', [frLocale]);

        return (
          <div className="Footer">
            <div className={ `connexion ${online} ${status}` }>
                <span>{ online === 'on' ? strings.footer.online : strings.footer.offline }</span>

                <div className="top">
                    <p>Satut : {status ==="blocked" ? "bloqué" : "activé"}</p>
                    <p>Connexion : { online === 'on' ? strings.footer.online : strings.footer.offline }</p>
                    {expiredate != null && <p>La caisse sera définitivement bloquée le : {expDate.format("LLL")}</p>}
                </div>
                

            </div >
            {/* <Detector
                render={({ online }) => (
                    <div className={`connexion ${online ? "on" : "off"}`}>
                        <span>{online ? strings.footer.online : strings.footer.offline }</span>
                    </div>
                )}
            /> */}
            <div className="build- version">{ `Splash360 Build v. ${packageJson.version}` }</div>
            <div className="right">
              <div className="date">{ this.state.date }</div>
              <div className="heure">{ this.state.heure }</div>
              {/* <div className="logout">
              </div> */}
            </div>
          </div>
        );
    }
}

export default Footer;