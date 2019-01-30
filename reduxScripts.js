import { createStore } from 'redux';

const initialState = {
    userId:"",
    timeline: {rants: [], isLoading: true, isRefreshing: false, modalVisible: false, imageModalVisible: false, imageDisplayed:""},
    search: {isFetching: false, search: [], query: "", lastQueryTime:0, selectedGroupId:"", modalOpen:false, mostPopularGroups:[], discoverGroups:[]},
    rantsLikedByUser: {rantsLiked: [], isRefreshing: true}
}
  
export function startSearchAction(query){
    return {type:'START_SEARCH', isFetching: true, query, timestamp:Date.now()};
}
  
export function completeSearchAction(timeQueryStarted, res){
    return {type: 'COMPLETED_SEARCH', isFetching:false, res:res, timeQueryStarted:timeQueryStarted}
}
export function setMostPopularGroups(groups){
    return {type:'SET_MOST_POPULAR_GROUPS', groups}
}

export function setDiscoverGroups(groups){
    return {type: "SET_DISCOVER_GROUPS", groups}
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

export function mountTimeline(rants){
    return {type: 'MOUNT_TIMELINE_WITH_RANTS', rants:rants}
}

export function stopLoadingTimeline(){
    return {type: 'STOP_LOADING_TIMELINE'}
}

export function refreshTimeline(){
    return {type: 'REFRESHING_TIMELINE'}
}

export function refreshCompleted(rants){
    return {type:'REFRESH_COMPLETED', rants:rants}
}

export function loadMoreTimeline(rants){
    return {type:'LOAD_MORE_TIMELINE', rants:rants}
}
export function stopRefreshing(){
    return {type: 'STOP_REFRESHING'}
}
export function startGettingRantsLiked(){
    return {type: 'START_GETTING_RANTS_LIKED'}
}

export function loadMoreRantsLiked(rants){
    return {type: 'LOAD_MORE_RANTS_LIKED', rants:rants};
}
export function removeFromLikedList(index){
    return {type: 'REMOVE_FROM_LIKED_LIST', index:index}
}
export function toggleRantLikesFromLikedComponent(index){
    return {type: 'TOGGLE_RANT_LIKES_FROM_LIKED_COMPONENT', index: index};
}
export function setRantsLikedByUser(rants){
    return {type: 'SET_RANTS_LIKED_BY_USER', rants: rants}
}
export function alterLikeRantScreen(rantId){
    return {type: 'ALTER_LIKE_RANT_SCREEN', rantId: rantId};
}
export function alterLikeLikeScreen(rantId){
    return {type: 'ALTER_LIKE_LIKE_SCREEN', rantId: rantId};
}



  
function groupReducer(state = initialState, action){
    if(state){
        switch(action.type){
            case 'START_SEARCH':
                if(action.timestamp >= state.search.lastQueryTime){
                    return Object.assign({}, state, {search: {...state.search, isFetching: action.isFetching, lastQueryTime: action.timestamp, search:[], query:action.query}});
                }
                else{
                    return state;
                }
                break;
            case 'COMPLETED_SEARCH':
                console.log("PROBLEM IS HERE");
                console.log(action.timeQueryStarted, state.search.lastQueryTime);
                if(action.timeQueryStarted >= state.search.lastQueryTime){
                    return Object.assign({}, state, {search:{...state.search, search: action.res, isFetching: false, lastQueryTime: state.search.lastQueryTime}});
                }
                else{
                    return state;
                }
                break;

            case 'SET_MOST_POPULAR_GROUPS':
                return Object.assign({}, state, {search:{...state.search, mostPopularGroups: action.groups}});
                break;
            case 'SET_DISCOVER_GROUPS':
                return Object.assign({}, state, {search:{...state.search, discoverGroups: action.groups}});
                break;
            
            case 'UPDATE_GROUP_JOINED_ACTION':
                return Object.assign({}, state, {groupsJoined: action.res});
                break;
            case 'TOGGLE_MODAL':
                return Object.assign({}, state, {search: {...state.search, accessCode:'', modalOpen: action.state, selectedGroupId: action.selectedGroupId}});
                break;
            case 'ENTERING_ACCESS_CODE':
                return Object.assign({}, state, {search: { ...state.search, accessCode: action.accessCode}});
                break;
            case 'MOUNT_TIMELINE_WITH_RANTS':
                return Object.assign({}, state, {timeline: {...state.timeline, rants:action.rants, isLoading:false}});
                break;
            case 'STOP_LOADING_TIMELINE':
                return Object.assign({}, state, {timeline: {...state.timeline, isLoading:false}});
                break;
            case 'REFRESHING_TIMELINE':
                return Object.assign({}, state, {timeline: {...state.timeline, isRefreshing:true}})
                break;
            case 'REFRESH_COMPLETED':
                console.log(action.rants);
                return Object.assign({}, state, {timeline:{...state.timeline, isRefreshing: false, rants: action.rants}})
                break;
            case 'LOAD_MORE_TIMELINE':
                if(state.timeline.rants[0] && action.rants[0] && state.timeline.rants[0].rant_id != action.rants[0].rant_id){
                    return Object.assign({}, state, {timeline: {...state.timeline, rants: [... state.timeline.rants, ... action.rants], isRefreshing:false}})
                    break;
                }
                else{
                    return state;
                }
            case 'STOP_REFRESHING':
                return Object.assign({}, state, {timeline: {...state.timeline, isRefreshing:false}})
                break;

            case 'START_GETTING_RANTS_LIKED':
                return Object.assign({}, state, {rantsLikedByUser:{rantsLiked: state.rantsLikedByUser.rantsLiked, isRefreshing: true}})
                break;
            
            case 'ALTER_LIKE_RANT_SCREEN':
                indexToAlter =  state.timeline.rants.map((item)=>{return item.rant_id}).indexOf(action.rantId);
                if(indexToAlter> -1){
                    newTimeline = Object.assign({}, state.timeline);
                    newTimeline.rants[indexToAlter].liked_by_user = !newTimeline.rants[indexToAlter].liked_by_user;
                    return Object.assign({}, state, {timeline: {...newTimeline}});
                }
                return state;
                break;
            
            case 'ALTER_LIKE_LIKE_SCREEN':
                indexToAlter =  state.rantsLikedByUser.rantsLiked.map((item)=>{return item.rant_id}).indexOf(action.rantId);
                if(indexToAlter> -1){
                    newRantsLikedByUser = Object.assign({}, state.rantsLikedByUser);
                    newRantsLikedByUser.rantsLiked[indexToAlter]["unliked"] = newRantsLikedByUser.rantsLiked[indexToAlter]["unliked"] ? false : true;
                    return Object.assign({}, state, {rantsLikedByUser: {...newRantsLikedByUser}});
                }
                return state;
                break;

            case 'REMOVE_FROM_LIKED_LIST':
                rantIdToBeRemoved = state.timeline.rants[action.index].rant_id;
                newRantsLikedByUser = Object.assign({}, state.rantsLikedByUser);
                indexToRemoveInLikedList =  newRantsLikedByUser.rantsLiked.map((item)=>{return item.rant_id}).indexOf(rantIdToBeRemoved);
                console.log("HERE IN REMOVAL", indexToRemoveInLikedList);
                if(indexToRemoveInLikedList>-1){
                    newRantsLikedByUser.rantsLiked[indexToRemoveInLikedList]["unliked"] = newRantsLikedByUser.rantsLiked[indexToRemoveInLikedList]["unliked"] ? false : true;
                    return Object.assign({}, state, {rantsLikedByUser: {...newRantsLikedByUser}});
                }
                return state;
                break;
            case 'TOGGLE_RANT_LIKES_FROM_LIKED_COMPONENT':
                rantIdToBeToggled = state.rantsLikedByUser.rantsLiked[action.index].rant_id;
                newRantTimeline = Object.assign({}, state.timeline);
                indexToBeToggled=  newRantTimeline.rants.map((item)=>{return item.rant_id}).indexOf(rantIdToBeToggled);
                console.log("HERE IN REMOVAL", indexToBeToggled);
                if(indexToBeToggled >-1){
                    newRantTimeline.rants[indexToBeToggled]["liked_by_user"] = !newRantTimeline.rants[indexToBeToggled]["liked_by_user"];
                    return Object.assign({}, state, {timeline: {...newRantTimeline}});
                }
                return state;
                break;
            case 'LOAD_MORE_RANTS_LIKED':
                return Object.assign({}, state, {rantsLikedByUser:{rantsLiked: [...state.rantsLikedByUser.rantsLiked, ...action.rants], isRefreshing: false}});
                break;
            case 'SET_RANTS_LIKED_BY_USER':
                return Object.assign({}, state, {rantsLikedByUser:{rantsLiked: action.rants, isRefreshing: false}});
                break;
            
            
            default:
                return state;

        }

    }
    else{
        return initialState;
    }
}


var store = createStore(groupReducer);
console.log(store.getState());
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


