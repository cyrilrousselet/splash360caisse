import { sub, differenceInMinutes, isBefore, endOfYesterday, parseISO } from 'date-fns';
import Logger from '../../helpers/Logger';

const logger = new Logger();


export const numeroServices = {
  setNumero
}


function setNumero(parametres, numero) {

  const { heure_fin } = parametres.entreprise;
  const { numerotation_start, numerotation_max, numerotation_hex } = parametres.commandes;

  logger.log('NumeroServices.setNumero()');

  let newvalue = null;

  // si un numéro est défini
  if (null!==numero && numero.hasOwnProperty('updated')) {

    // *** définition de la fin de la période précédente
    // fin de la période précédente
    const now = new Date();
    const hfin_ar = heure_fin.split(':');
    const hfin = parseInt(hfin_ar[0]);
    const mfin = parseInt(hfin_ar[1]);
    let lastperiode_end = endOfYesterday();

    // si l'heure actuelle est > à l'heure de fin, la fin de la période précédente était ce matin
    if (differenceInMinutes(now, now.setHours(hfin,mfin))>0) {
      lastperiode_end = now.setHours(hfin,mfin);
    } else {
      lastperiode_end = sub(now, {hours: 24}).setHours(hfin,mfin);
    }
    

    // si la dernière numérotation date d'un service précédent,
    // on repart de la valeur du début
    if (isBefore(parseISO(numero.updated), lastperiode_end)) {
      newvalue = parseInt(numerotation_start);
    } 
    // sinon on continue la numérotation
    else {
      // si la valeur du numéro est sous la valeur maximum
      if (parseInt(numero.value) < parseInt(numerotation_max)) {
        newvalue = parseInt(numero.value) + 1;
      }
      // sinon on repart de la valeur du début
      else {
        newvalue = parseInt(numerotation_start);
      }
    }
  }
  // sinon on crée un numéro en partant de la valeur du début
  else {
    newvalue = parseInt(numerotation_start);
  }

  const newnumero = {value: newvalue, hex: numerotation_hex, updated: new Date()};

  localStorage.setItem('numero', JSON.stringify(newnumero));
  
  return newnumero;

}