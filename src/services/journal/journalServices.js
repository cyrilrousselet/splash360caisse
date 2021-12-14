import logger from "../../helpers/Logger"; 

export const journalServices = {
  write
}

async function write(evt, type) {
  if (type==='jet') {
    logger.jet(evt);
  } else {
    logger.pa(evt);
  }
  return true;
}
