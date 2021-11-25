import React from 'react';

import LoadingSpinner from './common/LoadingSpinner';
// import Logger from '../helpers/Logger';
import logger from '../helpers/Logger';
import Swal from 'sweetalert2';
import schedule from 'node-schedule';
// import { data } from '../constants/translations';
import moment from 'moment';

// const logger = new Logger();



class MainLoader extends React.Component {
  
  _findeservice_job = null;
  _scheduledcmd_job = null;
  _getstatus_job = null;
  _blockstation_job = null
  _checkinternetconnection_job = null;

  constructor(props) {
    super(props);
    
    let first_start = props.params ? props.params.first_start : null;


    this.state = {
      first_start: first_start,
      paramLoaded: props.paramLoaded,
      sseInit: props.sseInit,
      catLoaded: props.catLoaded,
      cmdLoaded: true,
      cloLoaded: props.cloLoaded,
      inspect: false,
      statuschecked: props.statuschecked
    };
  }

  checkInstallation(mode) {
    const { 
      paramLoaded, 
      catLoaded, 
      // catLoading, 
      // cmdLoaded, 
      // cmdLoading, 
      cloLoaded, 
      sseInit, 
      params,
      paramsEntreprise, 
      dbupdated, 
      dbgetInit,
      checkFinDeService,
      checkScheduledCommandes,
      // stationinstalled,
      statuschecked,
      getStatus,
      blockStation,
      testConnection,
      online,
      storeKeys,
      storeNumerotation
    } = this.props;

    console.log("DEBUT checkInstallation");

  

    storeKeys();
    storeNumerotation();

    let first_start = params ? params.first_start : null;
    let readytolaunch = dbupdated || null;

    if (!paramLoaded) {
      console.log("GONNA GET PARAMETRES");
      this.props.getParametres();
    }

    if(paramLoaded) {
      console.log("PARAM LOADED");

      

      // if(online === null) { // if connexion pas
      //   testConnection();
      // }
 
      if(paramsEntreprise.restaurant_id==="" || paramsEntreprise.restaurant_secret==="") {
        console.log("NO ID SECRET, GONNA INSTALL STATION");
        // installStation
        this.props.installStation(); // popin + requête au bo + update id et secret
      }
      else {
        logger.info("ID SECRET OK");
        
        if (statuschecked===false) {
          getStatus();
        }
        else {
          if(online === null) { 
            testConnection();
          }
          else { 
            console.log("GONNA CHECK EXPIRE DATE");
        
            let expDate = localStorage.getItem("expireDate");
            if (expDate != null) { // if expiredate != null
              let date = moment(expDate);
              let today = moment();
        
              logger.dump("expDate", date);
              logger.dump("today", today);
        
              if (date.isBefore(today)) {// if expire date < now
                logger.info("date expiration dépassé, station doit etre bloquée");
                blockStation();// block station
              }
              else { // schedule block
                logger.info("schedule block");
                if(this._blockstation_job===null) {
                  this._blockstation_job = schedule.scheduleJob("blockstationJob", expDate, () => {
                    blockStation();
                  })
                }
                logger.dump("JOB BLOCK STATION");
              }
            }

            const status = localStorage.getItem('status');
          
            if (sseInit===false) {
              logger.info("GONNA INIT SSE");
              first_start = params.first_start;
              this.props.initSSE();
              this.props.setPOS();
              this.props.initSync();
        
              checkFinDeService();   
            }
        
            if (status==="authorized" && first_start===true && dbgetInit===false){
              console.log("GONNA GET DATABASE");
              this.props.getDatabase();
            }
            else if(status === null || status === "pending"){
              Swal.fire({
                type: 'warning',
                title:'Station non activée',
                text: 'Vous devez activer la station',
                showCancelButton: false,
                focusConfirm: true,
                allowEscapeKey: false,
                allowOutsideClick: false,
                confirmButtonText: 'Réésayer',
              }).then((result)=> {
                if (result.value) {
                  this.forceUpdate();
                }
              });
            }
          }
        }
      }
    }



    if (first_start===false) {
      if (paramLoaded===true && sseInit===true && 
          catLoaded===false) {
        this.props.getCatalogue();
        this.props.getLastClotureAndAfter();
      }
    //   if (paramLoaded===true && sseInit===true && catLoaded===true) {
    //  //   this.props.getTodayCommandesList();
    //     // this.props.loadNumero();
    //   }
      if (paramLoaded===true && sseInit===true && catLoaded===true && 
          cloLoaded===false) {
        this.props.getCloturesList();
        if(mode==="mount") {
          this.props.getTodayCa();
        }
        this.props.getCurrentPeriode();
      }
      if (paramLoaded===true && sseInit===true && catLoaded===true && cloLoaded===true) {
        if (readytolaunch && readytolaunch.length===2) {

          Swal.fire({
            type: 'warning',
            title:'Installation prête',
            text: 'Vous devez redémarrer l’application pour terminer l’installation',
            showCancelButton: false,
            focusConfirm: true,
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then((result)=> {
            if (result.value) {
              this.props.quitApp();
            }
          });

        } else if (readytolaunch===null) {
          this.props.initSyncCommandes();
          this.props.initSyncClotures();
          this.props.checkScheduledCommandes();  
          checkScheduledCommandes();
          this.props.loadingComplete();
        }
      }
    }
  }

  componentDidMount() {
    console.log("componentDidMount");

    const { 
      checkFinDeService,
      checkScheduledCommandes,
      checkNotif,
      resetNumero,
      getTodayCa,
      getStatus,
      testConnection,
    } = this.props;

    if (this._findeservice_job===null) {  
      this._findeservice_job = schedule.scheduleJob('0 30 5 * * *', () => {
      // this._findeservice_job = schedule.scheduleJob('0 20 11 * * *', () => {
        checkFinDeService();
        resetNumero();
        getTodayCa();
      });
    } 

    if (this._scheduledcmd_job===null) {
      this._scheduledcmd_job = schedule.scheduleJob('*/5 * * * *', () => {
        checkScheduledCommandes();
        checkNotif();
      });
    }

    if (this._getstatus_job===null) {
      console.log("GONNA START SCHEDULE");
      this._getstatus_job = schedule.scheduleJob('0 0 6 * * *', () => { //récupérer le status de la caisse sur le bo
        getStatus();
      })
    }

    if(this._checkinternetconnection_job===null) {
      this._checkinternetconnection_job = schedule.scheduleJob('*/1 * * * *', () => {
        // check internet with ping to bo
        console.log("job test connection");
        testConnection();
      });
    }

    this.checkInstallation("mount");
  }

  componentDidUpdate(prevProps, prevState) {
    logger.info("componentDidUpdate");
    this.checkInstallation("update");
  }

  render() {

    const { 
      paramLoaded, 
      catLoaded, 
      cloLoaded,
      sseInit,
      first_start
    } = this.props;


    return (      
      <div>
        <LoadingSpinner className="MainLoader-loading" />
        <div className="MainLoader-items">
          {first_start && <p className="MainLoader-item">Acquisition de la base de données...</p>}
          {paramLoaded && <p className="MainLoader-item">Paramètres chargés</p>}
          {sseInit && <p className="MainLoader-item">SSE initialisé</p>}
          {catLoaded && <p className="MainLoader-item">Catalogue chargés</p>}
          {cloLoaded && <p className="MainLoader-item">Clotures chargées</p>}
        </div>
      </div>
    );
  }
}

export default MainLoader;