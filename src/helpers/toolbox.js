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