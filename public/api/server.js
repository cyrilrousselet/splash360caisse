const express = require("express");
const api_server = express();
const sync_server = express();
const log = require("electron-log");
const cors = require("cors");
const { net } = require("electron");

const http = require("http").Server(sync_server);
const io = require("socket.io")(http);
const ioclient = require("socket.io-client");
const { difference, intersection } = require("lodash");

const dbCatalogueApi = require("./dbCatalogueApi.js");
const dbClientsApi = require("./dbClientsApi.js");
const dbCloturesApi = require("./dbCloturesApi.js");
const dbCommandesApi = require("./dbCommandesApi.js");
const dbEmployesApi = require("./dbEmployesApi.js");
const dbMarketingApi = require("./dbMarketingApi.js");
const dbUsersApi = require("./dbUsersApi.js");
const dbTresorerieApi = require("./dbTresorerieApi.js");

const DATABASES = {
  'categories': dbCatalogueApi,
  'groupes': dbCatalogueApi,
  'tva': dbCatalogueApi,
  'types': dbCatalogueApi,
  'ingredients': dbCatalogueApi,
  'produits': dbCatalogueApi,
  'steps': dbCatalogueApi,
  'clotures': dbCloturesApi,
  'commandes': dbCommandesApi,
  'ticketsrestau': dbCommandesApi,
  'users': dbUsersApi,
  'tresors': dbTresorerieApi,
  'clients': dbClientsApi,
  'pointages': dbEmployesApi,
  'timeadjusts': dbEmployesApi,
  'shifts': dbEmployesApi,
  'avoirs': dbMarketingApi,
  'reglespanier': dbMarketingApi,
  'reglescatalogue': dbMarketingApi
}

const connectedSecondaries = {};
const connectedTerminals = {};

let socket = null;

let webContents = null;

const API_PORT = 3300;
const SYNC_PORT = 3340;

const SYNCHRO_TREATMENT = {
  commande: "setCommandeSync",
  archivecommandes: "archiveCommandesSync",
  client: "setClientSync",
  ticketrestaurant: "setTicketRestaurantSync",
  pointage: "setPointageSync",
  avoir: "setAvoirSync",
  deleteavoir: "deleteAvoirSync",
  timeadjust: "setTimeadjustSync",
  cloture: "setClotureSync",
  tresor: "setTresorSync",
  user: "setUserSync",
  produit: "setProduitSync",
  groupe: "setGroupeSync",
  ingredient: "setIngredientSync",
  type: "setIngredientTypeSync",
  setsyncedcommandes: "setSynchedCommandesSync",
};

let responses = [];

let _emitter = null;
let _primaryUrl = null;

const server = {
  init: (wcont) => {
    log.info("server.init()");

    webContents = wcont;

    // xpr.use(cors({
    //   origin: function(origin, callback){
    //     // allow requests with no origin
    //     // (like mobile apps or curl requests)
    //     if(!origin) return callback(null, true);
    //     if(allowedOrigins.indexOf(origin) === -1){
    //       var msg = 'The CORS policy for this site does not ' +
    //                 'allow access from the specified Origin.';
    //       return callback(new Error(msg), false);
    //     }
    //     return callback(null, true);
    //   }
    // }));
    api_server.disable("x-powered-by");
    api_server.use(cors({ origin: "*" }));

    api_server.use(express.urlencoded({ extended: false })).use(express.json());
    api_server.get("/", (req, res) => {
      log.info("GET : " + req.query.fui);
      let __d = new Date();
      res.json({
        status: "success",
        commandeid: "c" + __d.getTime().toString(),
      });
    });
    api_server.post("/", (req, res) => {
      log.info("POST : " + req.body.data);
      let __d = new Date();
      res.json({
        status: "success",
        commandeid: "c" + __d.getTime().toString(),
      });
    });
    // ajout de commande depuis les bornes
    api_server.post("/setcommande", (req, res) => {
      log.info("POST setcommande", req.body.data);

      const response_id = responses.push(res) - 1;
      wcont.send("setCommande", { data: req.body.data, response: response_id });
    });

    api_server.post("/getnumero", (req, res) => {
      log.info("POST getnumero");
      const response_id = responses.push(res) - 1;
      wcont.send("getNumero", { response: response_id });
    });

    // SYNCHRO secondary -> primary
    api_server.post("/synchro", (req, res) => {
      const { db, data, emitter } = req.body;
      log.info("POST synchro", req.body);
      log.info("POST db", req.body["db"], `from ${emitter.nom}`);

      const response_id = responses.push(res) - 1;

      synchroTreatment(db, data, emitter, response_id);
    });

    api_server.post("/chrono", (req, res) => {
      log.info("POST chrono", req.body);

      wcont.send("chrono", { commande: req.body });
      res.json({ status: "success" });
    });

    api_server.listen(API_PORT, () => {
      log.info(`api_server listening on *:${API_PORT}`);
    });
  },
};

const synchroTreatment = (db, data, emitter = null, response = null) => {
  log.info("synchroTreatment()", db, emitter);

  if (webContents !== null) {
    if (SYNCHRO_TREATMENT.hasOwnProperty(db)) {
      webContents.send(SYNCHRO_TREATMENT[db], { data, emitter, response });
    } else {
      log.error("webContents null (server non initialisé)");
    }
  } else {
    log.error("webContents null (server non initialisé)");
  }
};

const welcomeTreatment = async (station_uniqid, exclusion=false) => {

  // requête pour exclure la station ou pour inclure la station
  const mongo_query = exclusion 
  ? {
      $or:[
        { localsync: { $exists: false } },
        { localsync: { $ne: station_uniqid } }
      ]
    }
  : { localsync: { $eq: station_uniqid } }
  ;

  const ldb_query = {stationid:station_uniqid, exclusion:exclusion};

  const catalogue_sum = await dbCatalogueApi.dbCatalogueSummary(ldb_query);
  const clients_sum = await dbClientsApi.dbClientsSummary(ldb_query);
  const clotures_sum = await dbCloturesApi.dbCloturesSummary(mongo_query);
  const commandes_sum = await dbCommandesApi.dbCommandesSummary(mongo_query, ldb_query);
  const employes_sum = await dbEmployesApi.dbEmployesSummary(ldb_query);
  const marketing_sum = await dbMarketingApi.dbMarketingSummary(ldb_query);
  const users_sum = await dbUsersApi.dbUsersSummary(ldb_query);
  const tresors_sum = await dbTresorerieApi.dbTresorerieSummary(mongo_query);

  return {
    ...catalogue_sum,
    ...clients_sum,
    ...clotures_sum,
    ...commandes_sum,
    ...employes_sum,
    ...marketing_sum,
    ...users_sum,
    ...tresors_sum,
  };
};

/**
 * Compare les listes des entités
 * et définit une liste d'items à importer et une liste d'items à exporter
 *
 * @param {*} primarySum liste des tables et des entités {id, updatedAt} de la caisse principale
 * @param {*} secondarySum liste des tables et des entités {id, updatedAt} de la caisse secondaire
 */
const getImportExport = (primarySum, secondarySum) => {
  const prmkeys = Object.keys(primarySum);
  const seckeys = Object.keys(secondarySum);

  // récup des clés (noms des tables) pour chaque summary
  const indbkeys = difference(prmkeys, seckeys);
  const outdbkeys = difference(seckeys, prmkeys);
  const comdbkeys = intersection(seckeys, prmkeys);

  // liste des tables à importer
  let in_db = {};
  // ajout des tables inexistantes à importer
  indbkeys.forEach((k) => {
    Object.defineProperty(in_db, k, {
      value: primarySum[k],
      enumerable: true,
      writable: false,
      configurable: false,
    });
  });

  // liste des tables à exporter
  let out_db = {};
  // ajout des tables inexistantes à exporter
  outdbkeys.forEach((k) => {
    Object.defineProperty(out_db, k, {
      value: secondarySum[k],
      enumerable: true,
      writable: false,
      configurable: false,
    });
  });

  // ajout des tables existantes aux deux listes ('à importer' et 'à exporter')
  comdbkeys.forEach((k) => {
    const incom = [];
    const outcom = [];

    // pour chaque table en commun, on récupère les différences

    // dans la liste de la caisse 'primary'
    primarySum[k].forEach((nty) => {
      const found = secondarySum[k].find((snty) => snty.id == nty.id);
      // si un item a été trouvé
      if (found) {
        // si l'item a été mis à jour
        if (nty.updatedAt) {
          // si l'item correspondant a été mis à jour
          if (found.updatedAt) {
            // si l'item est plus récent il doit être importé
            if (nty.updatedAt > found.updatedAt) {
              incom.push(nty);
            }
            // si l'item correspondant est plus récent il doit être exporté
            else {
              outcom.push(found);
            }
          }
          // si l'item correspondant n'a pas été mis à jour
          // l'item doit être importé
          else {
            incom.push(nty);
          }
        }
        // si l'item n'a pas été mis à jour
        else {
          // si l'item correspondant a été mis à jour
          // il doit être exporté
          if (found.updatedAt) {
            outcom.push(found);
          }
        }
      }
      // s'il n'a pas été trouvé il doit être importé
      else {
        incom.push(nty);
      }
    });

    // dans la liste de la caisse 'secondary'
    secondarySum[k].forEach((nty) => {
      const found = primarySum[k].find((pnty) => pnty.id == nty.id);
      // si aucun item ne correspond, il doit être exporté
      if (!found) {
        outcom.push(nty);
      }
    });

    // s'il y a des items à importer, on ajoute la table
    if (incom.length > 0) {
      Object.defineProperty(in_db, k, {
        value: incom,
        enumerable: true,
        writable: true,
        configurable: false,
      });
    }

    // s'il y a des items à exporter, on ajoute la table
    if (outcom.length > 0) {
      Object.defineProperty(out_db, k, {
        value: outcom,
        enumerable: true,
        writable: true,
        configurable: false,
      });
    }
  });

  return { importation: in_db, exportation: out_db };
};

const actions = {
  // renvoie le ticketId et le numero de la commande synchronisée par une borne
  sendTicketId: (req, res) => {
    const { ticketId, numero, response } = req.payload;
    // log.info(response);
    responses[response].json({
      status: "success",
      commandeid: ticketId,
      numero: numero,
    });

    log.info("ticketID : " + ticketId + " numero: " + numero);

    res.send({ msg: "ticketID sent" });
  },

  // renvoie le numero de commande demandé par une caisse 'secondary'
  sendNumeroCommande: (req, res) => {
    const { numero, response } = req.payload;

    responses[response].json({ status: "success", numero: numero });

    log.info("numero: ", numero);

    res.send({ msg: "numero sent" });
  },

  // demande un numero de commande à la caisse 'primary'
  askNumero: (req, res) => {
    const { url } = req.payload;

    let __confirmation = [];

    log.info("askNumero", req.payload);

    const __request = net.request({
      url: url + ":" + API_PORT + "/getnumero",
      method: "post",
    });
    // __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader("Access-Control-Allow-Origin", "*");
    __request.setHeader("Content-Type", "application/json");

    // __request.write(JSON.stringify({db, data, emitter}));

    __request.on("response", (response) => {
      log.info(`askNumero() to ${url}, status:`, response.statusCode);
      //   log.info(`acceptUberOrder STATUS: ${response.statusCode}`);
      //   log.info(`acceptUberOrder HEADERS: ${JSON.stringify(response.headers)}`);
      response.on("data", (chunk) => {
        __confirmation.push(chunk);
        log.info(`askNumero BODY: ${chunk}`);
      });
      response.on("end", () => {
        log.info("askNumero: end");
        const result = JSON.parse(__confirmation.join(""));
        res.send({ numero: result.numero });
      });
    });

    __request.on('error', (error) => {
      log.error('askNumero ERROR', error);
      res.error(error);
    });

    __request.end();
  },

  // confirme la bonne réception des synchro s/m
  syncConfirm: (req, res) => {
    const { confirm, response } = req.payload;
    if (response !== null) {
      responses[response].json({
        status: "ok" === confirm ? "success" : "error",
      });
      res.send({ msg: "sync confirm sent" });
    }
  },

  resync: async (req, res) => {
    const { liste, caisseId } = req.payload;



    const start = async () => {
      await asyncForEach(Object.entries(connectedSecondaries), async ([sockid, secondary]) => {



        let __summary = {};

        const mongo_query = {
          $or:[
            { localsync: { $exists: false } },
            { localsync: { $ne: secondary.uniqid } }
          ]
        };
        const ldb_query = {stationid:secondary.uniqid, exclusion:true};

        const start_secondary = async () => {
          await asyncForEach(liste, async (entity) => {
            if ('tresor'===entity) {
              const tresors_sum = await dbTresorerieApi.dbTresorerieSummary(mongo_query);
              __summary = {...__summary, ...tresors_sum};
            }
            else if ('commandes'===entity) {
              const commandes_sum = await dbCommandesApi.dbCommandesSummary(mongo_query);
              __summary = {...__summary, ...commandes_sum};
            } 
            else if ('clotures'===entity) {
              const clotures_sum = await dbCloturesApi.dbCloturesSummary(mongo_query);
              __summary = {...__summary, ...clotures_sum};
            } 
            else if ('employes'===entity) {
              const employes_sum = await dbEmployesApi.dbEmployesSummary(ldb_query);
              __summary = {...__summary, ...employes_sum};
            } 
            else if ('marketing'===entity) {
              const marketing_sum = await dbMarketingApi.dbMarketingSummary(ldb_query);
              __summary = {...__summary, ...marketing_sum};
            } 
            else if ('users'===entity) {
              const users_sum = await dbUsersApi.dbUsersSummary(ldb_query);
              __summary = {...__summary, ...users_sum};
            }
            else if ('catalogue'===entity) {
              const catalogue_sum = await dbCatalogueApi.dbCatalogueSummary(ldb_query);
              __summary = {...__summary, ...catalogue_sum};
            }
            else if ('clients'===entity) {
              const clients_sum = await dbClientsApi.dbClientsSummary(ldb_query);
              __summary = {...__summary, ...clients_sum};
            }
          });
        };

        start_secondary();

        io.to(sockid).emit("resync", {summary: __summary, liste: liste, primary: caisseId});
      });
    }
    start();

    res.send({ msg: "summary envoyé aux secondaries num. " + Object.keys(connectedSecondaries).length });

  },

  // on lance la connexion au "primary" (si la caisse est "secondary")
  syncConnectToPrimary: (req, res) => {
    const { url, caisse } = req.payload;

        
    _emitter = caisse;
    _primaryUrl = url;


    log.info("syncConnectToPrimary", req.payload);

    socket = ioclient(url + ":" + SYNC_PORT);
    socket.on("connect", () => {
      socket.emit("register", caisse);
    });

    // accusé de réception de la connexion de la part du "primary"
    // avec la liste des summary (éléments à échanger entre les caisses)
    socket.on("welcome", async (welcomeData) => {
      log.info("on welcome");
      const {summary, primary} = welcomeData;

      const secondarySum = await welcomeTreatment(caisse.uniqid);

      const { importation, exportation } = getImportExport(
        summary,
        secondarySum
      );

      log.info("import:", importation);
      log.info("export:", exportation);

      prepareExportationToPrimary(exportation);

      askImportationFromPrimary(importation);

    });

    // écouteur de synchro de la part du primary
    socket.on("sync", (payload) => {
      log.info("on sync", payload);

      synchroTreatment(payload.db, payload.data);
    });

    // écouteur de resynchro de la part du primary
    // (le primary envoie une liste de ses entités
    // qu'il faut comparer avec celle du secondary)
    socket.on("resync", (payload) => {
      const {summary, liste, primary} = payload;
      log.info('resync', liste, summary, primary);

      const secondarySum = await welcomeTreatment(_emitter.uniqid);

      const { importation, exportation } = getImportExport(
        summary,
        secondarySum
      );

      log.info("resync import:", importation);
      log.info("resync export:", exportation);

      prepareExportationToPrimary(exportation);

    })

    res.send({ msg: "connection sent to primary" });
  },

  // déconnexion du primary
  syncDisconnectFromPrimary: (req, res) => {
    if (socket) socket.disconnect();
    res.send({ msg: "disconnected from primary" });
  },

  // lancement du webservice (si la caisse est "primary")
  syncStartPrimary: (req, res) => {
    log.info("Start sync service on primary ...");
    sync_server.use(cors({ origin: "*" }));

    const {caisseId} = req.payload;

    io.on("connection", (sock) => {
      log.info(
        `${
          Object.keys(connectedSecondaries).length
        } socket(s) connected. New id : `,
        sock.id
      );
      // on signale l'initialisation de la communication descendante (entre le primary et le secondary)
      io.to(sock.id).emit("sync", { type: "syncinit" });

      // écouteur d'événement 'register' :
      // le secondary envoie son identité afin que le primary la stocke dans un objet
      sock.on("register", async (data) => {
        log.info("secondary register", data);

        Object.defineProperty(connectedSecondaries, sock.id, {
          value: data,
          writable: false,
          enumerable: true,
          configurable: true,
        });

        const summary = await welcomeTreatment(data.uniqid, true);
        io.to(sock.id).emit("welcome", {summary: summary, primary: caisseId});
      });

      // écouteur d'événement 'registerterminal' :
      // la borne envoie son identité afin que la caisse la stocke dans un objet
      sock.on("registerterminal", async (data) => {
        log.info("borne register", data);

        Object.defineProperty(connectedTerminals, sock.id, {
          value: data,
          writable: false,
          enumerable: true,
          configurable: true,
        });

        io.to(sock.id).emit("welcome");
      });

      sock.on("sync", (action) => {
        log.info("sync", action);
        //   io.to(sock).emit('connect');
      });

      // à la déconnexion du secondary, on le supprime de l'objet de référence
      sock.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          sock.connect();
        }
        // else the socket will automatically try to reconnect
        Object.entries(connectedSecondaries).forEach(([sockid]) => {
          // console.log("device", device)
          try {
            if (sockid == sock.id) {
              // console.log("socket", socket.id)
              delete connectedSecondaries[sockid];
            }
          } catch (error) {
            log.info("sync disconnect error", error.message);
          }
        });
      });
    });

    http.listen(SYNC_PORT, function () {
      log.info(`sync_server listening on *:${SYNC_PORT}`);
      res.send({ msg: "primary waits for secondaries" });
    });
  },

  // émission de la synchro du primary en direction des secondaries
  syncDispatchToSecondaries: (req, res) => {
    const { db, data, emitter } = req.payload;

    // on envoie la synchro à tous les secondaries,
    // sauf celui qui est à l'origine de la synchro
    Object.entries(connectedSecondaries).forEach(([sockid, secondary]) => {
      if (emitter !== secondary.id) io.to(sockid).emit("sync", req.payload);
    });

    // s'il s'agit d'une synchro de produit ou d'ingrédient, on envoie la synchro à toutees les bornes,
    // sauf celui qui est à l'origine de la synchro
    if (["ingredient", "produit"].includes(db)) {
      let prix = db === "ingredient" ? data.supplement : data.prix;
      let centimes = Math.round(Number(prix) * 100);
      log.info(`Prix du produit : ${centimes} centimes`);
      Object.entries(connectedTerminals).forEach(([sockid, secondary]) => {
        io.to(sockid).emit("updateproduit", {
          id: data.custom_id,
          active: data.active,
          prix: centimes,
        });
      });
    }

    log.info(
      `syncDispatchToSecondaries() [${db}] to ${
        Object.keys(connectedSecondaries).length
      } secondaries and ${Object.keys(connectedTerminals).length} terminals`
    );
    res.send({
      msg: `sync to ${
        Object.keys(connectedSecondaries).length
      } secondaries and ${Object.keys(connectedTerminals).length} terminals`,
    });
  },

  syncDispatchToPrimary: (req, res) => {
    const { db, data, emitter, url } = req.payload;

    log.info("syncDispatchToPrimary", req.payload);

    const __request = net.request({
      url: url + ":" + API_PORT + "/synchro",
      method: "post",
    });
    // __request.setHeader('Authorization','Bearer '+access_token)
    __request.setHeader("Access-Control-Allow-Origin", "*");
    __request.setHeader("Content-Type", "application/json");

    __request.write(JSON.stringify({ db, data, emitter }));

    __request.on("response", (response) => {
      log.info(
        `syncDispatchToPrimary() [${db}] to ${url}, status:`,
        response.statusCode
      );
      res.send({ msg: `synchro ${db} to primary` });

      response.on("data", () => {

      });
      response.on("end", () => {

      });
    });

    __request.on('error', (error) => {
      log.error('syncDispatchToPrimary ERROR', error);
      res.error(error);
    });

    __request.end();
  },
};


async function askImportationFromPrimary(importation) {

}

async function prepareExportationToPrimary(exportation) {

  const start = async () => {
    asyncForEach(Object.entries(exportation), async ([db, items]) => {

      const ids = items.map(i=>i.id);
      const __data = await DATABASES[db].dbGetItems(db,ids);
      bulkSyncToPrimary(db, __data);
    });
  }

  start();

}

function bulkSyncToPrimary(db, data) {

  const __request = net.request({
    url: _primaryUrl + ":" + API_PORT + "/synchro",
    method: "post",
  });
  // __request.setHeader('Authorization','Bearer '+access_token)
  __request.setHeader("Access-Control-Allow-Origin", "*");
  __request.setHeader("Content-Type", "application/json");

  __request.write(JSON.stringify({ db, data, emitter }));

  __request.on("response", (response) => {
    log.info(
      `bulkSyncToPrimary() [${db}] to ${_primaryUrl}, status:`,
      response.statusCode
    );

    response.on("data", () => {

    });
    response.on("end", () => {

    });
  });

  __request.on('error', (error) => {
    log.error('bulkSyncToPrimary ERROR', error);
  });

  __request.end();
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


module.exports = {
  ...server,
  ...actions,
};
