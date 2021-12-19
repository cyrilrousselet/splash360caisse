import logger from "../../helpers/Logger"; 
import { remote } from 'electron';
import { last } from 'lodash';
import format from "date-fns/format";

const { app } = remote;
const fs = require('fs').promises;

export const journalServices = {
  write,
  setSignature,
  getPreviousFilename,
  getFilename
}

async function write(evt, type) {
  if (type==='jet') {
    logger.jet(evt);
  } else {
    logger.pa(evt);
  }
  return true;
}

async function setSignature(hashsignature, type) {
  if (type==='jet') {
    logger.jetsign(hashsignature);
  } else {
    logger.pasign(hashsignature);
  }
}

// retourne l'avant-dernier fichier du type ('jet' ou 'pa')
async function getPreviousFilename(type) {
  
  const filerad = type==="jet" ? '-jet.json' : '-pistedaudit.json';

  const aujdh = parseInt(format(new Date(),'yyDDD'));

  // chemin du dossier des journaux
  const compta_dir = `${app.getPath('userData')}/compta/`;

  let files;
  try {
    // on récupère la liste des journaux
    files = await fs.readdir(compta_dir);
  }
  catch(e) {
    console.error('impossible de scanner le dossier compta', e);
    return false;
  }

  if (files===undefined) {
    console.log('fichier de compta undefined');
    return false;
  } else {
    // on ne garde que les fichiers du type dont la date (dans le nom) est inférieure à aujourd'hui
    const __jetfiles = files.filter( f => f.includes(filerad) && (parseInt(f.substring(0,5))< aujdh) );

    // on renvoie le dernier de la liste (le plus récent)
    return last(__jetfiles.sort());
  }
}

// retourne le dernier fichier du type ('jet' ou 'pa')
async function getFilename(type) {
  
  const filerad = type==="jet" ? '-jet.json' : '-pistedaudit.json';

  // chemin du dossier des journaux
  const compta_dir = `${app.getPath('userData')}/compta/`;

  let files;
  try {
    // on récupère la liste des journaux
    files = await fs.readdir(compta_dir);
  }
  catch(e) {
    console.error('impossible de scanner le dossier compta', e);
    return false;
  }
  if (files===undefined) {
    console.log('fichier de compta undefined');
    return false;
  } else {
    // on ne garde que les fichiers du type (du bon nom)
    const __jetfiles = files.filter( f => f.includes(filerad));
    
    // on renvoie le dernier de la liste (le plus récent)
    return last(__jetfiles.sort());
  }
}