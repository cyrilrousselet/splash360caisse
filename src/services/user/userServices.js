import { emit } from 'eiphop';
import { createObjectCsvWriter } from 'csv-writer';

export const userServices = {
 login,
 loginSU,
 logout,
 getAll,
 update,
 checkUsers,
 setAdmin,
 delete: _delete,
 exportListe,
};

function login(passphrase) {

  return emit('dbUsersLogin', {identifiant:passphrase});

  // const user = {
  //   'id': 1,
  //   'nom': 'Admin',
  //   'droits': [
  //     'cartes',
  //     'clients',
  //     'stocks',
  //     'statistiques',
  //     'menu',
  //     'parametres',
  //     'cloture',
  //     'marketing',
  //   //  'depenses',
  //     'listecommandes',
  //     'employes',
  //     'remise'
  //   ]
  // }


}

function loginSU(passphrase) {
  return emit('dbUsersLoginSU' , {identifiant:passphrase});
}

function setAdmin(passphrase) {
  const user = {
    user_id: 'usr0',
    nom: 'Admin',
    identifiant: passphrase,
    status: 'active',
    droits: {
      'cartes': true,
      'clients': true,
      'stocks': true,
      'statistiques': true,
      'menu': true,
      'parametres': true,
      'cloture': true,
      'marketing': true,
      'depenses': true,
      'listecommandes': true,
      'employes': true,
      'remise': true
    }
  }
  return emit('dbAddUser', {user: user});
}

function checkUsers() {
  return emit('dbHasUsers',{});
}


function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function getAll() {
  return emit('dbUsersGetAll',{});
}

function update(user) {
  return emit('dbUpdateUser', {user: user});
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {}


// function handleResponse(response) {
//   return response.text().then(text => {
//       const data = text && JSON.parse(text);
//       if (!response.ok) {
//           if (response.status === 401) {
//               // auto logout if 401 response returned from api
//               logout();
//             //  location.reload(true);
//           }

//           const error = (data && data.message) || response.statusText;
//           return Promise.reject(error);
//       }

//       return data;
//   });
//}

function exportListe(target, liste) {

  console.log('exportFEC', liste);
  
  const csvWriter = createObjectCsvWriter({
    path: target,
    header: liste.header
  });

  return csvWriter.writeRecords(liste.data);

}