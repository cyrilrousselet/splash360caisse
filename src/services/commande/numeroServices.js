import { isBefore, parseISO } from 'date-fns';
import { dateBounds } from '../../helpers/toolbox';
// import Logger from '../../helpers/Logger';
import logger from '../../helpers/Logger';

// const logger = new Logger();


export const numeroServices = {
  setNumero,
  getNumero,
}

/**
 * Vérification de la validité du numéro (provenant du reducer)
 * S'il est valide, on l'incrémente
 * sinon, on repart du numéro de départ
 * et on stocke le numéro dans le localStorage
 * avant de le retourner
 * 
 * @param {*} numero 
 * @param {*} parametres 
 * @returns {Object} numero
 */
function setNumero(numero, parametres) {

  const { numerotation_start, numerotation_hex } = parametres.commandes;

  const newvalue = _checkNumero(numero, parametres) ? parseInt(numero.value) + 1 : parseInt(numerotation_start)
  const newnumero = {value: newvalue, hex: numerotation_hex, updated: new Date()};

  localStorage.setItem('numero', JSON.stringify(newnumero));
  
  return newnumero;
}


/**
 * Vérification de la validité du numéro (provenant du reducer)
 * S'il est valide, on le retourne
 * sinon, on retourne le numéro de départ
 * 
 * @param {*} numero 
 * @param {*} parametres 
 * @returns {Object} numero
 */
 function getNumero(numero, parametres) {

  const { numerotation_start, numerotation_hex } = parametres.commandes;

  const newvalue = _checkNumero(numero, parametres) ? numero.value : numerotation_start    
  const newnumero = {value: parseInt(newvalue), hex: numerotation_hex, updated: new Date()};
  
  return newnumero;

}

function _checkNumero(numero, parametres) {

  const { heure_fin } = parametres.entreprise;
  const { numerotation_max } = parametres.commandes;

  console.log('NumeroServices.setNumero()',parametres,numero);

  let isValid = true;

  // si un numéro est défini
  if (null!==numero && numero.hasOwnProperty('updated')) {

    // // *** définition de la fin de la période précédente
    const __periode = dateBounds(new Date(), heure_fin);
    const lastperiode_end = __periode.debut;
    

    // si la dernière numérotation date d'un service précédent,
    // on repart de la valeur du début
    if (isBefore(parseISO(numero.updated), lastperiode_end)) {
      isValid = false;
    } 
    // sinon on continue la numérotation
    else {
      // si la valeur du numéro est sous la valeur maximum
      if (parseInt(numero.value) < parseInt(numerotation_max)) {
        isValid = true;
      }
      // sinon on repart de la valeur du début
      else {
        isValid = false;
      }
    }
  }
  // sinon on crée un numéro en partant de la valeur du début
  else {
    isValid = false;
  }

  return isValid;

}