import {emit} from 'eiphop';

export const catalogueServices = {
  getAllActive,
  getAll
 };

function getAll() {

  return emit('dbCatalogueGetAll', {from: 'services/catalogueService'})
    .then(res => { 
      console.log(res);
    })
    .catch(err => console.log(err))
  ;
} 

function getAllActive() {
  // return emit('dbCatalogueGetAllActive', {from: 'services/catalogueService'})
  //   .then(res => { 
  //     console.log(res);
  //   })
  //   .catch(err => console.log(err))
  // ;
  return emit('dbCatalogueGetAllActive', {from: 'services/catalogueService'});
}

// async function getAllActive() {
//   const cat = await db.categories.find({});
//   return cat;

//  }


// async function getAll() {

//   const cat = await db.categories.find({});
//   return cat;

// }