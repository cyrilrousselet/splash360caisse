
export const userServices = {
 login,
 logout,
 getAll,
 update,
 delete: _delete
};

function login(passphrase) {

  const user = {
    'id': 1,
    'nom': 'Cyril',
    'droits': [
      'cartes',
      'clients',
      'stocks',
      'statistiques',
      'menu',
      'parametres',
      'cloture',
      'marketing',
    //  'depenses',
      'listecommandes',
      'plannings',
      'remise'
    ]
  }

  // store user details and jwt token in local storage to keep user logged in between page refreshes
  localStorage.setItem('user', JSON.stringify(user));

  return new Promise(function(resolve, reject) {
    resolve(user);
  });

}



function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function getAll() {
  return {}
}

function update(user) {

}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {}


function handleResponse(response) {
  return response.text().then(text => {
      const data = text && JSON.parse(text);
      if (!response.ok) {
          if (response.status === 401) {
              // auto logout if 401 response returned from api
              logout();
            //  location.reload(true);
          }

          const error = (data && data.message) || response.statusText;
          return Promise.reject(error);
      }

      return data;
  });
}