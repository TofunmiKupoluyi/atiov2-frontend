import { createStore } from 'redux';

const initialState = {
    modalOpen: false,
    groupsJoined:  [],
    selectedGroupId:"",
    userId:"",
    search: {isFetching: false, search: [], query: "", lastQueryTime:0}
}
  
export function startSearchAction(query){
    return {type:'START_SEARCH', isFetching: true, query, timestamp:Date.now()};
}
  
export function completeSearchAction(timeQueryStarted, res){
    return {type: 'COMPLETED_SEARCH', isFetching:false, res:res, timeQueryStarted:timeQueryStarted}
}

export function updateGroupsJoinedAction(res){
    return {type: 'UPDATE_GROUP_JOINED_ACTION', res:res}
}

export function toggleModalAction(state, groupId){
    return {type: 'TOGGLE_MODAL', state:state, selectedGroupId: groupId}
}

export function enteringAccessCode(accessCode){
    return {type: 'ENTERING_ACCESS_CODE', accessCode: accessCode}
}
  
function groupReducer(state = initialState, action){
    if(state){
        switch(action.type){
            case 'START_SEARCH':
                if(action.timestamp >= state.search.lastQueryTime){
                    return Object.assign({}, state, {search: {isFetching: action.isFetching, lastQueryTime: action.timestamp, search:[], query:action.query}});
                }
                else{
                    return state;
                }
                break;
            case 'COMPLETED_SEARCH':
                console.log(action.timeQueryStarted, state.search.lastQueryTime);
                if(action.timeQueryStarted >= state.search.lastQueryTime){
                    return Object.assign({}, state, {search:{search: action.res, isFetching: false, lastQueryTime: state.search.lastQueryTime, query: ""}});
                }
                else{
                    return state;
                }
                break;
            case 'UPDATE_GROUP_JOINED_ACTION':
                return Object.assign({}, state, {groupsJoined: action.res});
                break;
            case 'TOGGLE_MODAL':
                return Object.assign({}, state, {accessCode:'', modalOpen: action.state, selectedGroupId: action.selectedGroupId});
                break;
            case 'ENTERING_ACCESS_CODE':
                return Object.assign({}, state, {accessCode: action.accessCode});
                break;
        }

    }
    else{
        return initialState;
    }
}


var store = createStore(groupReducer);
export default store;

// SHOULD YOU WANT TO TEST THE SEARCH SCRIPT RUN THIS:

// store.dispatch(startSearchAction('he'));
// var timeDispatched1 = Date.now();

// setTimeout(()=>{
//   store.dispatch(startSearchAction('hello'));
//   var timeDispatched2 = Date.now();
//   setTimeout(()=>{
//     store.dispatch(startSearchAction('hell'));
//     store.dispatch(completeSearchAction(timeDispatched2, ["Hello1"]));
  
//     setTimeout(()=>{
//       store.dispatch(completeSearchAction(timeDispatched1, ["Hello2"])); 
//       console.log(store.getState());
//     }, 1000);
    
//   }, 500);

// }, 200);
