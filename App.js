import React, {PureComponent ,Component } from 'react';
import DisplayComponentIOS from './DisplayIOS'
import DisplayComponentAndroid from './DisplayAndroid'
import {Platform} from 'react-native'
import { Provider, connect } from 'react-redux';
import store from './reduxScripts'


export default class App extends Component{
  render() {
    return (
      <Provider store={store}>
        <AppComponent/>
      </Provider>
    );
  }
}
    
const mapStateToProps = (state)=>{
  // console.log("HERE AGAIN", state.rantsLikedByUser);
  return { 
    timeline: state.timeline, 
    rantsLikedByUser: state.rantsLikedByUser,
    search: state.search
  };
}

if(Platform.OS === 'android')
  AppComponent = connect(mapStateToProps)(DisplayComponentAndroid);
else
  AppComponent = connect(mapStateToProps)(DisplayComponentIOS);
      
      
        
      
    
