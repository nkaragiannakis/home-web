var types = require('../constants/ActionTypes');
require('es6-promise').polyfill();

var QueryActions = require('./QueryActions');
var HistoryActions = require('./HistoryActions');

var { getFilteredData } = require('../utils/chart');
var { getDeviceKeysByType } = require('../utils/device');
var { getTimeByPeriod, getLastShowerTime } = require('../utils/time');

const setLastSession = function(session) {
  return {
    type: types.DASHBOARD_SET_LAST_SESSION,
    session: session,
  };
};

const createInfobox = function(data) {
  return {
    type: types.DASHBOARD_ADD_INFOBOX,
    data: data
  };
};

const deleteInfobox = function(id) {
  return {
    type: types.DASHBOARD_REMOVE_INFOBOX,
    id: id
  };
};

const updateInfobox = function(id, update) {
  return {
    type: types.DASHBOARD_UPDATE_INFOBOX,
    id,
    update 
  };
};

const appendLayout = function(id, type) {
  let layout = {x:0, y:0, w:1, h:1, i:id};
  if (type==='stat') {
    Object.assign(layout, {w:2, h:1, minW:2, minH:1});
  }
  else if (type === 'chart') {
    Object.assign(layout, {w:2, h:2, minW:2, minH:2});
  }
  return {
    type: types.DASHBOARD_APPEND_LAYOUT,
    layout: layout 
  };
};

const DashboardActions = {

  updateInfoboxTemp: function(data) {
    return {
      type: types.DASHBOARD_UPDATE_INFOBOX_TEMP,
      data: data
    };
  },
  resetInfoboxTemp: function() {
    return {
      type: types.DASHBOARD_RESET_INFOBOX_TEMP,
    };
  },

  switchMode: function(mode) {
    return {
      type: types.DASHBOARD_SWITCH_MODE,
      mode: mode
    };
  },
  addInfobox: function(data) {
    return function(dispatch, getState) {
      const infobox = getState().section.dashboard.infobox;
      const lastId = infobox.length?Math.max.apply(Math, infobox.map(info => parseInt(info.id))):0;
      const id = (lastId+1).toString();
      const type = data.type;
      dispatch (createInfobox(Object.assign(data, {id})));
      dispatch(appendLayout(id, type));
      return id;
    };
  },
  removeInfobox: function(id) {
    return function(dispatch, getState) {
      dispatch(deleteInfobox(id));
    };
  },
  fetchInfoboxData: function(data) {
    return function(dispatch, getState) {
      const { id, type, subtype, deviceType, period } = data;
      const device = getDeviceKeysByType(getState().user.profile.devices, deviceType);
      let time = getTimeByPeriod(period);
      
      if (!device || !device.length) return new Promise((resolve, reject) => resolve()); 

      const found = getState().section.dashboard.infobox.find(x => x.id === id);

      if (found && found.data && found.data.length>0){
        console.log('found infobox data in memory');
        return new Promise((() => found), (() => getState().query.errors));
      }

      if (subtype === "last") {
        time = getLastShowerTime();

        return dispatch(QueryActions.fetchLastSession(device, time))
        .then(session => session)
        .then(response => dispatch(updateInfobox(id, {index: response.index, device:response.device, data:response.data, period: "custom", time})))
        .catch(error => { console.error(error); });
      }
      else {
        return dispatch(QueryActions.queryDeviceOrMeter(device, time))
        .then(sessions =>  dispatch(updateInfobox(id, {data:sessions, time})))
        .catch(error => { console.error(error); });
      }
    };
  },
  fetchAllInfoboxesData: function() {
    return function(dispatch, getState) {
      getState().section.dashboard.infobox.map(function (infobox) {
        if (infobox.type === 'chart' || infobox.type === 'stat')
        return dispatch(DashboardActions.fetchInfoboxData(infobox));
      });
    };
  },
  updateLayout: function(layout) {
    return {
      type: types.DASHBOARD_UPDATE_LAYOUT,
      layout: layout
    };
  },

};

module.exports = DashboardActions;