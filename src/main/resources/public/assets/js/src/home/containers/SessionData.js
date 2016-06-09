var React = require('react');
var { bindActionCreators } = require('redux');
var { connect } = require('react-redux');
var injectIntl = require('react-intl').injectIntl;

var { getChartTimeData } = require('../utils/chart');
var { getDataSessions } = require('../utils/transformations');

var SessionModal = require('../components/Session');

var HistoryActions = require('../actions/HistoryActions');

function mapStateToProps(state, ownProps) {
  return {
    data: state.section.history.data,
    activeSessionFilter: state.section.history.activeSessionFilter,
    activeSession: state.section.history.activeSession,
    };
}
function mapDispatchToProps (dispatch) {
  return bindActionCreators(HistoryActions, dispatch);
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const data = ownProps.sessions?
  (stateProps.activeSession!==null?
    ownProps.sessions.find(s=> s.device===stateProps.activeSession[0] && s.id===stateProps.activeSession[1] || s.timestamp===stateProps.activeSession[1]):{})
  :{};

  if (!data || !data.measurements) return stateProps;

  
  const xMin = data.measurements[0].timestamp;
  const xMax = data.measurements[data.measurements.length-1].timestamp;
  return Object.assign(
    {}, 
    ownProps, 
    dispatchProps,
    Object.assign({}, 
                  stateProps, 
                  {
                    data,
                    xMin,
                    xMax,
                    chartData: getChartTimeData(data.measurements?data.measurements:[], stateProps.activeSessionFilter, null),
                    showModal: stateProps.activeSession===null?false:true,
                  })
  );
}

var SessionData = connect(mapStateToProps, mapDispatchToProps, mergeProps)(SessionModal);
SessionData = injectIntl(SessionData);
module.exports = SessionData;
