const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const moment = require('moment')
const differenceInSeconds = require('date-fns/differenceInSeconds');

const db = require('../db.js');
const lodashId = require('lodash-id');
const log = require('electron-log');

const devicesPerZones = {}
const clients = {}
let pendingOrders = {}
let finishedOrders = {}
let caredOrdersSalle = {}
let periodHistory = 1800

let webContents = null;


// try {
//   pendingOrders = db.getData("/pendingOrders");
// } catch(error) {
  
//   console.error(error);
// }

// try {
//   finishedOrders = db.getData("/finishedOrders");
// } catch(error) {  
//   console.error(error);
// }

// let indexOrder = 0

// try {
//   indexOrder = db.getData("/indexOrder");  
// } catch(error) {  
//   console.error(error);
// }

function refresh() {
  // caredOrdersSalle = {}
  // finishedOrders = {}
  // pendingOrders = {}
  // indexOrder = 0
  // db.push("/pendingOrders", {})
  // db.push("/caredOrdersSalle", {})
  // db.push("/finishedOrders", {})
  // db.push("/indexOrder", 0)
}

// {productName: "frites", status: 0, handledBy: null, quantity: 1, zone: "chaud"}

async function setOrderV2(order) {

  if (!order) {

    log.info('setOrderV2:', 'TEST à vide');
    order = {
      id: "001",
      origine: "caisse",
      name: "Julien",
      mode: "sur place",
      timestamp: 1,
      status: 0,
      endTime: undefined,
      careTime: undefined,
      items: [{productName: "salade", quantity: 2, zone: ["tck2","tck3"], status: 0, handledBy: null, subItems: [{subProductName:"tomates", quantity: 1}]}, {productName: "soupe", status: 0, handledBy: null, quantity: 1, zone: "tck2"}]      
    };
  }
  log.info('setOrderV2:', order);
  
    
    const __now = new Date().getTime();
    order.timestamp = __now;

    pendingOrders[order.id] = order;


    // db.push("/pendingOrders", pendingOrders)


    let __order = {...order, createdAt: __now, updatedAt: __now};
    const _ord = await (await db.pendingOrders).get('pendingOrders')
                                              .push(__order)
                                              .write();


    // if (indexOrder < 22) {
    //   indexOrder ++
    // }
    
    // db.push("/indexOrder", indexOrder)



    const items = order.items
    let zonesOrder = []
    // Object.keys(items).forEach((item) => {  
    items.forEach((item) => {  
      // if (Array.isArray(items[item].zone)) {
      //   zonesOrder = [...zonesOrder, ...items[item].zone];
      // }  else {
      //   zonesOrder.push(items[item].zone)
      // }   
      item.zones.forEach((zone) => {
        zonesOrder.push(zone.name)
      })  
      item.subItems.forEach((subItem) => {
        subItem.zones.forEach((zone) => {
          zonesOrder.push(zone.name)
        })
      })
    })


    zonesOrder = [...new Set(zonesOrder)]
    
    log.info("zonesorder", zonesOrder)
    log.info("devices per zones", devicesPerZones)
    zonesOrder.forEach((zoneOrder) => {      
      Object.keys(devicesPerZones).forEach((zoneDevice) => {        
        if (zoneOrder == zoneDevice) {          
          devicesPerZones[zoneDevice].forEach((device)=> {            
            io.to(device).emit('action', {type:'UPDATE_ORDER', payload: order})          
          })          
        }
      })      
    })  

  
}


function cleanFinishedOrders(zone, socket) {
  
  // log.info('cleanFinishedOrders', zone);
  const __now = new Date();

    let newFinished = {}
    if (Object.keys(finishedOrders).length > 0) {    
      Object.keys(finishedOrders).forEach((key) => {
    //    const endTime = moment(finishedOrders[key].endTime) 
    //    const period = moment().diff(endTime, 'seconds')
        const diff = differenceInSeconds(new Date(finishedOrders[key].endTime), __now);
    //    if (period < periodHistory) {
        if (diff < periodHistory) {
          newFinished[key] = finishedOrders[key]
        }
      })
    }
    if (socket && zone != "salle") {
      
      socket.emit('action', {type:'SET_FINISHED_ORDERS', payload: newFinished})
      
    }
    Object.keys(devicesPerZones).forEach((zone) => {
      if (zone != "salle") {
        devicesPerZones[zone].forEach((device) => {
          io.to(device).emit('action', {type:'SET_FINISHED_ORDERS', payload: newFinished}) 
        })
      }
    })   
}

setInterval(() => {          
  cleanFinishedOrders()
}, 6000)



async function takeOrderV2(order, zoneOrder, ip) { 


  log.info('zoneOrder', zoneOrder);

  const now = new Date().getTime();
  const deviceZone = zoneOrder.name
  const orderId = order.id;
  // const notCared = (item) => item.status === 0

  const notCared = (item) => {

    let notCared = true
    log.info("order", order)
    if (item.zones.some((zone) => zone.status != 0)) {
      notCared = false
      return notCared
    }
    for (let i = 0; i < item.subItems.length; i++) {
      if (item.subItems[i].zones.some((zone) => zone.status != 0))  {
        notCared = true
        return notCared
        break
      }     
    } 
    return notCared
    
  }

  if (pendingOrders[orderId].items.every(notCared)) {
    // émettre pris en charge en salle
    careTimeObj = {}
    careTimeObj[deviceZone] = now
    careTimeObj.firstCare = now
    order.careTime = careTimeObj
    order.status = 1
    pendingOrders[orderId] = order
    // db.push("/pendingOrders", pendingOrders)


    let __upd = {...order, updatedAt: now};
    const _ord = await (await db.pendingOrders).get('pendingOrders')
                                        .find({id: order.id})
                                        .assign(__upd)
                                        .write();

    const _caredordsalle = await (await db.caredOrdersSalle).get('caredOrdersSalle')
                                        .find({id: order.id})
                                        .assign(__upd)
                                        .write();                                    


      
    if (devicesPerZones["salle"]){
      devicesPerZones["salle"].forEach((device)=> {            
        io.to(device).emit('action', {type:'UPDATE_CARED_ORDERS', payload: order})          
      })
    }      
      
  } else {
    const now = new Date().getTime()      
    order.careTime[deviceZone] = now
  }



    let truthOrder = pendingOrders[orderId]
  //  const itemOfZone = truthOrder.items.find(item => item.zone == zone)
    // if (itemOfZone.status === 0) {
    //   const updatedItems = truthOrder.items.map((item) => { 
    //     if (item.zone == zone) {
    //       item.status = 1
    //       item.handledBy = ip
    //       return item 
    //     } else {
    //       return item
    //     }           
    //   })  
      
    //   truthOrder.items = updatedItems
    //   pendingOrders[orderId] = truthOrder
    //   // db.push("/pendingOrders", pendingOrders)


    //   let __upd = {...truthOrder, updatedAt: now};
    //   const _ord = await (await db.pendingOrders).get('pendingOrders')
    //                                       .find({id: truthOrder.id})
    //                                       .assign(__upd)
    //                                       .write();



    //   devicesPerZones[zone].forEach((device)=> {            
    //     io.to(device).emit('action', {type:'UPDATE_ORDER', payload: truthOrder}) 
    //     io.to(device).emit('action', {type:'UPDATE_TIMESTATUS', payload: {[truthOrder.id]: 0}})          
    //   })      
    // }

    if (zoneOrder.status === 0) {
      const updatedItems = []
       truthOrder.items.forEach((item) => {        
         const updatedSubItems = []
         item.subItems.forEach((subItem) => {
           const newZonesSub = subItem.zones.map((zone) => {
             if (zone.name == deviceZone) {
               zone.status = 1
               return zone
             } else {
               return zone
             }
           })
           subItem.zones = newZonesSub
           updatedSubItems.push(subItem)
         })
         item.subItems = updatedSubItems
         const newZones = item.zones.map((zone) => {
           if (zone.name == deviceZone) {
             zone.status = 1
             return zone
           } else {
             return zone
           }
         })
         item.zones = newZones
         updatedItems.push(item)
       })     
       truthOrder.items = updatedItems
       pendingOrders[orderId] = truthOrder
       
      let __upd = {...truthOrder, updatedAt: now};
      const _ord = await (await db.pendingOrders).get('pendingOrders')
                                          .find({id: truthOrder.id})
                                          .assign(__upd)
                                          .write();


       devicesPerZones[deviceZone].forEach((device)=> {  
         io.to(device).emit('action', {type:'UPDATE_TIMESTATUS', payload: {[truthOrder.id]: 0}})          
         io.to(device).emit('action', {type:'UPDATE_ORDER', payload: truthOrder}) 
                   
       })      
     }

}

async function endOrderV2(order, zoneOrder, ip, socket) { 


  log.info('endOrderV2', order);
  log.info('zoneOrder', zoneOrder);
  log.info('pendingOrders', pendingOrders);
  const __now = new Date().getTime();

  const deviceZone = zoneOrder.name
  const orderId = order.id
  let otherDone = true
  let truthOrder = pendingOrders[orderId]
  if (!truthOrder) {
    log.info('order unknown -> return');
    return
  }
     

    if (zoneOrder.status === 1 || order.recalled) {
      const updatedItems = []
       truthOrder.items.forEach((item) => {
         
         const updatedSubItems = []
         item.subItems.forEach((subItem) => {
           const newZonesSub = subItem.zones.map((zone) => {
             if (zone.name == deviceZone) {
               zone.status = 2
               return zone
             } else {
               if (zone.status != 2) {
                 otherDone = false
               }
               return zone
             }
           })
           subItem.zones = newZonesSub
           updatedSubItems.push(subItem)
         })
         item.subItems = updatedSubItems
         const newZones = item.zones.map((zone) => {
           if (zone.name == deviceZone) {
             zone.status = 2
             return zone
           } else {
              if (zone.status != 2) {
                otherDone = false
              }
              return zone
           }
         })
         item.zones = newZones
         updatedItems.push(item)
       })    
       
       
       truthOrder.items = updatedItems
  
      socket.emit('action', {type:'REMOVE_TIMESTATUS', payload: orderId})
      if (otherDone) {
  
        // envoyer en salle comme terminé
        const now = new Date().getTime()
        truthOrder.endTime = now
        truthOrder.status = 2
        if (devicesPerZones["salle"]) {
          devicesPerZones["salle"].forEach((device)=> {                   
            io.to(device).emit('action', {type:'UPDATE_ORDER_SALLE', payload: truthOrder, received: true})
            io.to(device).emit('ring')
            io.to(device).emit('action', {type:'REMOVE_CARED_ORDER', payload: truthOrder})            
          })
        }
        
        // enlever des pending et des écrans des zones
        delete pendingOrders[orderId]
        delete caredOrdersSalle[orderId]
        finishedOrders[orderId] = truthOrder
        log.info("finished", finishedOrders)
        // db.push("/pendingOrders", pendingOrders)
        // db.push("/finishedOrders", finishedOrders)

        // envoi de l'update des temps de prise en charge pour persistance en bdd
    //    webContents.send('setProductionChrono', {ticketId: truthOrder.ticket_id, careTime: truthOrder.careTime, endTime: truthOrder.endTime});

        let __chrono = {ticketId: truthOrder.ticket_id, careTime: truthOrder.careTime, endTime: truthOrder.endTime, createdAt: __now, updatedAt: __now};
        const _chr = await (await db.cmdchrono).get('cmdchrono')
                                               .push(__chrono)
                                               .write();




        const _pord = await (await db.pendingOrders).get('pendingOrders')
                                                    .remove({ id: truthOrder.id })
                                                    .write();




        let __order = {...truthOrder, createdAt: __now, updatedAt: __now};
        const _ford = await (await db.finishedOrders).get('finishedOrders')
                                                    .push(__order)
                                                    .write();




        
        devicesPerZones[deviceZone].forEach((device)=> {            
          io.to(device).emit('action', {type:'REMOVE_ORDER', payload: truthOrder})          
        }) 
        Object.keys(devicesPerZones).forEach((zone) => {
          if (zone != "salle") {
            devicesPerZones[zone].forEach((device)=> {            
              socket.emit('action', {type:'UPDATE_FINISHED_ORDERS', payload: truthOrder})          
            }) 
          }
        })
        
      } else {
        truthOrder.items = updatedItems
        pendingOrders[orderId] = truthOrder
        // db.push("/pendingOrders", pendingOrders)

        let __upd = {...truthOrder, updatedAt: __now};
        const _ord = await (await db.pendingOrders).get('pendingOrders')
                                            .find({id: truthOrder.id})
                                            .assign(__upd)
                                            .write();


        devicesPerZones[deviceZone].forEach((device)=> {            
          io.to(device).emit('action', {type:'REMOVE_ORDER', payload: truthOrder})          
        }) 
      }
    }

  
}


function populateOrdersV2(zoneDevice, socket) {
  // const match = (element) => {
  //   return (element.zone === zone && element.status !== 2)
  // }
  // Object.keys(pendingOrders).forEach((orderId) => {
  //  if (pendingOrders[orderId].items.some(match)) {
     
  //   socket.emit('action', {type:'UPDATE_ORDER', payload: pendingOrders[orderId]})  
  //  }      
  // })  

  if (zoneDevice != "salle") {  
    const match = (item) => {
      log.info("item", item)
      let shouldSend = false
        if (item.zones.some((zone) => (zone.status != 2) && (zone.name == zoneDevice))) {
          shouldSend = true
          return shouldSend
        }
        for (let i = 0; i < item.subItems.length; i++) {
          if (item.subItems[i].zones.some((zone) => (zone.status != 2) && (zone.name == zoneDevice)))  {
            shouldSend = true
            return shouldSend
            break
          }     
        } 
        return shouldSend
    }   
    
    Object.keys(pendingOrders).forEach((orderId) => {
      if (pendingOrders[orderId].items.some(match)) {
        
        socket.emit('action', {type:'UPDATE_ORDER', payload: pendingOrders[orderId]})  
      }      
    }) 
  } else {
    Object.keys(finishedOrders).forEach((orderId) => { 
      log.info("in emit", finishedOrders[orderId])    
       socket.emit('action', {type:'UPDATE_ORDER_SALLE', payload: finishedOrders[orderId]})          
     }) 
    Object.keys(caredOrdersSalle).forEach((orderId) => {     
      socket.emit('action', {type:'UPDATE_CARED_ORDERS', payload: caredOrdersSalle[orderId]})          
    })
  }


}



function transmitOrderV1(order) {
  // log.info("in server func", order)
  
  const now = new Date().getTime()
  order.endTime = now
  if (devicesPerZones["salle"]) {
    devicesPerZones["salle"].forEach((device)=> {                   
      io.to(device).emit('action', {type:'UPDATE_ORDER_SALLE', payload: order, received: true})
      io.to(device).emit('ring')
                 
    })
  }
}

async function recallOrder(order, socket) {
  order.status = 1
  order.recalled = {status: true, timestamp: new Date().getTime()}
  order.timestamp = 0
  delete finishedOrders[order.id]
  pendingOrders[order.id] = order
 // db.push("/pendingOrders", pendingOrders)
 // db.push("/finishedOrders", finishedOrders)

  const __now = new Date().getTime();

  log.info("recallOrder", order);

  const _ford = await (await db.finishedOrders).get('finishedOrders')
                                               .remove({ id: order.id })
                                               .write();




  let __order = {...order, createdAt: __now, updatedAt: __now};
  const _pord = await (await db.pendingOrders).get('pendingOrders')
                                              .push(__order)
                                              .write();


  socket.emit('action', {type:'UPDATE_ORDER', payload: order}) 
  cleanFinishedOrders();
}


function transmitOrderAlt(order) {
  log.info("func", order)
  const now = new Date().getTime()
  order.endTime = now
  if (devicesPerZones["salle"]) {
    devicesPerZones["salle"].forEach((device)=> {                   
      io.to(device).emit('action', {type:'UPDATE_ORDER_SALLE', payload: order})
      io.to(device).emit('ring')                
    })
  }
}


io.on('connection', function(socket){
  // log.info("Socket connected: " + socket.id);

  log.info('Socket connected:', socket.id);
  // socket.emit("askForZone")
  socket.on('action', (action) => {
    if(action.type === 'server/sendZone'){
      log.info('devicesPerZones:', devicesPerZones);
      const zone = action.payload      

      const array = devicesPerZones[zone] || []
      array.push(socket.id)
      
      devicesPerZones[zone] = array
      // log.info(devicesPerZones)
      log.info('devicesPerZones:', devicesPerZones);
      log.info("length pend", Object.keys(pendingOrders).length)
      log.info("length fin", Object.keys(finishedOrders).length)
      if (Object.keys(pendingOrders).length > 0 || Object.keys(finishedOrders).length > 0) {
        log.info("about to populate")
        populateOrdersV2(zone, socket)
      }     
        cleanFinishedOrders(zone, socket)   
    } else if (action.type === 'server/sendSettingOrderHistory') {
      periodHistory = action.payload
    } else if (action.type === 'server/setOrderV2'){      
      setOrderV2(action.payload)
    } else if (action.type === 'server/takeOrderV2'){      
      takeOrderV2(action.order, action.zoneOrder, action.ip)
    } else if (action.type === 'server/endOrderV2'){      
      endOrderV2(action.order, action.zoneOrder, action.ip, socket)
    } else if (action.type === 'server/sendOrderV1'){            
      transmitOrderV1(action.payload)
    } else if (action.type === 'server/refresh'){            
      refresh()
    } else if (action.type === 'server/recallOrderV2'){  
      recallOrder(action.order, socket)
    } else if (action.type === 'server/sendOrderAlt'){ 
       
      transmitOrderAlt(action.payload)
    }
  })

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    } 
    // else the socket will automatically try to reconnect
    Object.keys(devicesPerZones).forEach((zone) => {
      devicesPerZones[zone].forEach((device, i) => {
        // log.info("device", device)
        if (device == socket.id) {
          // log.info("socket", socket.id)
          let array = devicesPerZones[zone]
          array.splice(i, 1)
          
          devicesPerZones[zone] = array
        }
      })
    })
    
  });
})


http.listen(3330, function(){
  log.info('listening on *:3000');
});

const actions = {
  setOrderToKDS: (req, res) => {

    
    const { order } = req.payload;
    log.info('setOrderToKDS()', order);
    setOrderV2(order);
    
    res.send({msg: `set order ${order.id} in KDS`});
  }
};


const kds = {
  init: (wcont) => {
    log.info('kds.init()');
    webContents = wcont;
  }
};


    
module.exports = {
  ...kds,
  ...actions
};

