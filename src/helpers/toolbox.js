import { add, sub, endOfToday, endOfYesterday } from "date-fns";
import { isInteger } from "lodash";

export const devise = value => Number(value).toFixed(2).replace('.',',');
// export const devise = (value, debug=false) => { 
//   const dev = Number(value).toFixed(2).replace('.',',');
//   if (debug) {console.log(value, dev);} 
//   return dev;
// };
// export const htmlentities = value => value.replace(/<br \/>/gi, "\n");
export const htmlentities = value => value.replace('<br />', String.fromCharCode(10));
// export const htmlentities = value => value.replace('<br />', '');
// export const htmlentities = value => value;


export const dateBounds = (date, heure_fin) => {

  // *** définition de la fin de la période précédente
  // fin de la période précédente
  const now = (isInteger(date)) ? new Date(date) : date;
  const hnow_min = (now.getHours() * 60) + now.getMinutes();

  const hfin_ar = heure_fin.split(':');
  const hfin = parseInt(hfin_ar[0]);
  const mfin = parseInt(hfin_ar[1]);
  const hfin_min = (hfin * 60) + mfin;
  let debut = endOfYesterday();
  let fin = endOfToday();

  // si l'heure actuelle est > à l'heure de fin, le début de la période était ce matin
  // et la fin de la période sera demain matin
  if (hnow_min - hfin_min > 0) {
    debut = now.setHours(hfin,mfin);
    fin = add(now, {hours: 24}).setHours(hfin,mfin);
  } else {
    debut = sub(now, {hours: 24}).setHours(hfin,mfin);
    fin = now.setHours(hfin,mfin);
  }

  return {debut, fin};
}