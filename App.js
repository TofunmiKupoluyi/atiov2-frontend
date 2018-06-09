
import React, {PureComponent ,Component } from 'react';
import { Modal, FlatList, StyleSheet, Text, View, StatusBar, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ActivityIndicator, TextInput, Keyboard, KeyboardAvoidingView, Button, ScrollView, AsyncStorage } from 'react-native';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import Swiper from 'react-native-swiper';
import GridView from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import futch from './imageUpload';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import store, {alterLikeRantScreen, setDiscoverGroups, alterLikeLikeScreen, toggleRantLikesFromLikedComponent, setMostPopularGroups, startSearchAction, completeSearchAction, toggleModalAction, enteringAccessCode, refreshTimeline, refreshCompleted, stopRefreshing, loadMoreTimeline, mountTimeline, stopLoadingTimeline, startGettingRantsLiked, setRantsLikedByUser, removeFromLikedList, loadMoreRantsLiked} from './reduxScripts'

import ImagePicker from 'react-native-image-picker';


const Styles = StyleSheet.create({
  navBarStyle: {
    paddingTop: 22, 
    height: 70, 
    backgroundColor: 'deepskyblue', 
    flex:0, 
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent: 'space-between'
  },
  singlePageStyle:{
    flex:1, 
    borderTopLeftRadius:10, 
    borderTopRightRadius:10, 
    backgroundColor:'white', 
    overflow:'hidden', 
    paddingTop:5
  },
  loadingPageStyle:{
    flex:1, 
    flexDirection:"column", 
    justifyContent:"center", 
    borderTopLeftRadius:10, 
    borderTopRightRadius:10, 
    backgroundColor:'white', 
    overflow:'hidden', 
    paddingTop:5
  },
  imageCardStyle: {
    flex:1, 
    flexDirection:"column", 
    borderWidth: 1, 
    borderColor: 'gainsboro', 
    margin:10, 
    borderRadius:10
  },
  cardStyle:{
    flex:1, 
    flexDirection:"column", 
    borderWidth: 1, 
    borderColor: 'gainsboro', 
    margin:10, 
    borderRadius:10
  },
  imageSectionStyle: {
    height:200, 
    flexDirection:"row", 
    justifyContent:"center",
    borderTopWidth:1,
    borderTopColor:'gainsboro',
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
    overflow:'hidden'
    
  },
  imageStyle: {
    flex:1,  
    
  }

});


class Networking{
  static checkIfEmailIsValid(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  
  }

  static async register(email, pseudonym){
    if(!this.checkIfEmailIsValid(email)){
      return new Promise((resolve, reject)=>{
        reject({err:1});
      });
    }

    let returnedValue = await fetch('https://atio-v2.herokuapp.com/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        pseudonym: pseudonym,
      }),
    });

    let responseJson = await returnedValue.json();
      
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    });
  }

  static async checkIfPhoneIsRegistered(){
    const userId = await AsyncStorage.getItem("@AtioStore:userId");

    // Promise constructor runs all its processes then provides you with a reject and resolve function -- call back functions
    return new Promise((resolve, reject)=>{
      if(userId !== null){
        resolve(userId);
      }
      else{
        reject("Not yet created userId")
      }

    });
    
  }

  static async getRantsLikedByUser(userId, continueFrom, groupId){
    let returnedValue = await fetch('https://atio-v2.herokuapp.com/rant/getRantsLikedByUser', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        continueFrom: continueFrom,
        groupId: groupId
      }),
    });

    let responseJson = await returnedValue.json();
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    }); 

  }

  static async registerPhone(userId){
    
    try {
      console.log("HELLO")
      await AsyncStorage.setItem('@AtioStore:userId', ""+userId);
      return new Promise((resolve, reject)=>{
        resolve({err:0, res:"Set Successfully"})
      })
    } catch (error) {
      return new Promise((resolve, reject)=>{
        reject({err:1, res:"Unable to access async storage"})
      })
      // Error saving data
    }

  }

  static async likeRant(userId, rantId, groupId){
    let returnedValue = await fetch('https://atio-v2.herokuapp.com/rant/likeRant', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        rantId: rantId,
        groupId: groupId
      }),
    });

    let responseJson = await returnedValue.json();
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    })
  }

  static async getGroupsJoined(userId){
    let returnedValue = await fetch('https://atio-v2.herokuapp.com/group/getGroupsJoined', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    let responseJson = await returnedValue.json();
      
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    });
  }


  static async searchGroupsLimit(query, offset){
    if(!offset){
      let returnedValue = await fetch("https://atio-v2.herokuapp.com/group/searchGroupsLimit?query="+query);
      let responseJson = await returnedValue.json();
      return new Promise((resolve, reject)=>{
        resolve(responseJson);
      });
    } 
  }

  static async searchAllGroups(query, offset){
    if(offset){
      let returnedValue = await fetch("https://atio-v2.herokuapp.com/group/searchAllGroups?query="+query+"&offset="+offset);
      let responseJson = await returnedValue.json();
      return new Promise((resolve, reject)=>{
        resolve(responseJson);
      });
    }
    else{
      let returnedValue = await fetch("https://atio-v2.herokuapp.com/group/searchAllGroups?query="+query);
      let responseJson = await returnedValue.json();
      return new Promise((resolve, reject)=>{
        resolve(responseJson);
      });
    }
    
  }

  static async joinGroup(userId, groupId, accessCode){
    if(userId && groupId && accessCode){
      let returnedValue = await fetch('https://atio-v2.herokuapp.com/group/joinGroup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          groupId: groupId,
          accessCode: accessCode
        }),
      });

      let responseJson = await returnedValue.json();
      return new Promise((resolve, reject)=>{
        if(responseJson.err==1){
          reject(responseJson.res);
        }
        else{
          resolve(responseJson);
        }
      });

    }

    else{
      return new Promise((resolve, reject)=>{
        reject("Error in query")
      })
    }

  }

  static async postRant(userId, groupId, pseudonym, rantContent){
    if(userId, groupId, pseudonym, rantContent){
      let returnedValue = await fetch('https://atio-v2.herokuapp.com/rant/postRant', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          groupId: groupId,
          pseudonym: pseudonym,
          rantType: 0,
          rantContent: rantContent
        }),
      });

      console.log("HELLOOO", returnedValue);

      let responseJson = await returnedValue.json();
        return new Promise((resolve, reject)=>{
          if(responseJson.err==1){
            reject(responseJson.res);
          }
          else{
            resolve(responseJson);
          }
        }
      );
    
    }

    else{
      return new Promise((resolve, reject)=>{
        reject("Error in query")
      })
    }

  }

  static async postRantWithImage(userId, groupId, pseudonym, rantContent, imageSource){

    const data = new FormData();
    data.append('chatId', userId);
    data.append('groupId', groupId);
    data.append('pseudonym', pseudonym);
    data.append('rantType', 0);
    data.append('rantContent', rantContent);
    data.append('photo', {
      uri: imageSource,
      type: 'image/jpeg',
      name: 'testPhotoName'
    });


    futch('https://atio-v2.herokuapp.com/rant/postRant', {
      method: 'post',
      body: data
    }, (progressEvent) => {
      const progress = progressEvent.loaded / progressEvent.total;
      console.log(progress);
    }).then((res) => console.log(res), (err) => console.log(err))


  }

  static getPublicRants(continueFrom){
    if(!continueFrom){
      return fetch('https://atio-v2.herokuapp.com/rant/getPublicRants')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
    }
    else{
      return fetch('https://atio-v2.herokuapp.com/rant/getPublicRants?continueFrom='+continueFrom)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
    }


  }

  static async getRantsFromGroup(groupId, userId, continueFrom){

    if(!continueFrom){
      let returnedValue = await fetch("https://atio-v2.herokuapp.com/group/getRantsFromGroup", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          groupId: groupId
        })
      });
      
      if(returnedValue){
        let responseJson = await returnedValue.json();
        return new Promise((resolve, reject)=>{
          console.log("RETURN MESSAGE FROM ENDPOINT",responseJson);
          resolve(responseJson);
        });
      }
      else{
        return new Promise((resolve, reject)=>{
          reject("error");
        });
      }


    }
    else{
      let returnedValue = await fetch("https://atio-v2.herokuapp.com/group/getRantsFromGroup", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          groupId: groupId,
          continueFrom: continueFrom
        })
      });
      if(returnedValue){
        let responseJson = await returnedValue.json();
        return new Promise((resolve, reject)=>{
          resolve(responseJson);
        });
      }

      else{
        return new Promise((resolve, reject)=>{
          reject("Error");
        });
      }

    }

  }

  static async getMostPopularRants(){
    let returnedValue = await fetch('https://atio-v2.herokuapp.com/group/getMostPopularGroups');

    let responseJson = await returnedValue.json();
      
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    });
  }

  static async discoverGroups(){
    let returnedValue = await fetch('https://atio-v2.herokuapp.com/group/discoverGroups');

    let responseJson = await returnedValue.json();
      
    return new Promise((resolve, reject)=>{
      resolve(responseJson);
    });
  }



}

class NavBarComponent extends Component{
  constructor(props){
    super(props);
  }

  state= {
    height: 70,
    increasing: false
  }


  render(){
    if(this.props.showIcons){
      return(

        <View style = {[this.props.navBarStyle, {height: this.state.height}]}  >
          <TouchableHighlight onPress={this.props.onPressLeftButton} style={{padding:20}} underlayColor='#00abe5'>
            
            <Icon name="feather" size={20} color="white" />
          </TouchableHighlight>
          <Text style={{fontWeight:'bold',  fontSize:18, color:'white'}}>{this.props.title}</Text>
          <TouchableHighlight onPress = {this.props.onPressRightButton} style={{padding:20}} underlayColor='#00abe5'>
            
            <Icon name="settings" size={20} color="white" />
          </TouchableHighlight>
        </View>
        
      );
      
    }

    else{
      return(
        <View style = {this.props.navBarStyle} >
          <View></View>
          <Text style={{fontWeight:'bold',  fontSize:18, color:'white'}}>{this.props.title}</Text>
          <View></View>
        </View>
      );
    }
      
  }

}

class RantNavBarComponent extends PureComponent{
  
  constructor(props){
    super(props);
    this.state= {}
    this.postRant = this.postRant.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
  }
  postRant(){
    Keyboard.dismiss();
    if(!this.state.image){
      Networking.postRant(this.props.userId, this.props.groupId, this.props.pseudonym, this.props.rantContent).then((resp)=>{
        console.log(resp);
      });
    }
    else{
      Networking.postRantWithImage(this.props.userId, this.props.groupId, this.props.pseudonym, this.props.rantContent, this.state.image).then((resp)=>{
        console.log(resp);
      });
    }
    this.setState({image:null});
    
    this.props.clearState();
    console.log("Posted");

  }

  chooseImage(){
    var options = {
      title: 'Select Avatar',
      customButtons: [
        {name: 'fb', title: 'Choose Photo from Facebook'},
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.launchImageLibrary(options, (response)  => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };
        console.log(source);
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          ...this.state,
          image: source
        });
      }
    });
  }
  render(){
    return(
      <View style = {{paddingTop: 22, height: 70, backgroundColor: 'deepskyblue', flex:0, flexDirection:'row', alignItems:'center'}} >

        <View style={{flex:1}}>
          <TouchableHighlight onPress={()=>{this.chooseImage()}} underlayColor='#00abe5'>
          { (this.state.image) ?
            <Image style={{width:40, height:40, borderRadius:10, margin:10 }}source ={{uri: this.state.image.uri}}/>
            : <Icon style={{margin:10}} name="image" size={30} color="white"/> 
          }
          </TouchableHighlight>
        </View>
        <View style={{flex:1}}>
          <Text style={{fontWeight:'bold',  fontSize:18, color:'white', textAlign:'center'}}>Rant</Text> 
        </View>
        <View style={{flex:1}}>
          <TouchableHighlight style={{ backgroundColor:"white", margin:10, padding:10, borderRadius:20}} onPress={()=>{this.postRant()}} underlayColor='#00abe5'>
            <Text style={{color:"deepskyblue", fontWeight:"bold", fontSize:15, textAlign:'center'}}>Post</Text>
          </TouchableHighlight>
        </View>
       
      </View>
    );
  }
}

class CardComponent extends PureComponent{
  constructor(props){
    super(props);
    this._likeRant = this._likeRant.bind(this);
  }

  generateTime(timeStamp) {
    var now = new Date(),
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if(secondsPast < 60){
      return parseInt(secondsPast) + 's';
    }
    if(secondsPast < 3600){
      return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
      return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + " " + month + year;
      }
  }

  

  _likeRant(){
    var userId = this.props.userId;
    var rantId = this.props.rantId;
    var groupId = this.props.groupId;
    console.log(userId, rantId, groupId);
    Networking.likeRant(userId, rantId, groupId).then((resp)=>{
      if(resp.err == 0){
        if(this.props.root == 0){
          store.dispatch(alterLikeRantScreen(rantId));
          console.log("ABOUT TO REMOVE");
          store.dispatch(removeFromLikedList(this.props.index));
        }
        if(this.props.root == 1){
          store.dispatch(alterLikeLikeScreen(rantId));
          store.dispatch(toggleRantLikesFromLikedComponent(this.props.index));
        }
        console.log(resp);
      }
    });
  }

  render(){

    if(this.props.liked){
      return(
        <View style={Styles.cardStyle}>
          <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
            <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
                <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
                <TouchableOpacity onPress={this._onPressButton} style={{paddingRight:10}}>
                  <Image
                    style={{width:20, height:20, tintColor:"darkgray"}}
                    source={require('./image_assets/reply_image.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this._likeRant()}} style={{paddingRight:10, paddingLeft:10}} underlayColor='gray'>
                  <IconMaterial name="heart" size={20} color="red"></IconMaterial>
                </TouchableOpacity>
              </View>
            </View>
            <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
              <Text>{this.props.content}</Text>
            </View>
            {/* <Text style={{padding:5, paddingLeft:15, color:'darkgray'}}>{this.generateTime(new Date(obj.item.rant_date))}</Text> */}
            
            
          </View>
        </View>
      );
    }
    else{
      return(
      <View style={Styles.cardStyle}>
          <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
            <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
                <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
                <TouchableOpacity onPress={this._onPressButton} style={{paddingRight:10}}>
                  <Image
                    style={{width:20, height:20, tintColor:"darkgray"}}
                    source={require('./image_assets/reply_image.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{this._likeRant()}} style={{paddingRight:10, paddingLeft:10}} underlayColor='gray'>
                  <IconMaterial name="heart-outline" size={20} color="darkgray"></IconMaterial>
                </TouchableOpacity>
              </View>
            </View>
            <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
              <Text>{this.props.content}</Text>
            </View>
            {/* <Text style={{padding:5, paddingLeft:15, color:'darkgray'}}>{this.generateTime(new Date(obj.item.rant_date))}</Text> */}
            
            
          </View>
        </View>
      );
    }
  }
}

class ImageCardComponent extends PureComponent{
  constructor(props){
    super(props);
    this._likeRant = this._likeRant.bind(this);
  }

  generateTime(timeStamp) {
    var now = new Date(),
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if(secondsPast < 60){
      return parseInt(secondsPast) + 's';
    }
    if(secondsPast < 3600){
      return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
      return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + " " + month + year;
      }
  }

  _likeRant(){
    var userId = this.props.userId;
    var rantId = this.props.rantId;
    var groupId = this.props.groupId;
    console.log(userId, rantId, groupId);
    Networking.likeRant(userId, rantId, groupId).then((resp)=>{
      if(resp.err == 0){
        if(this.props.root == 0){
          store.dispatch(alterLikeRantScreen(rantId));
          console.log("ABOUT TO REMOVE");
          store.dispatch(removeFromLikedList(this.props.index));
        }
        if(this.props.root == 1){
          store.dispatch(alterLikeLikeScreen(rantId));
          store.dispatch(toggleRantLikesFromLikedComponent(this.props.index));
        }
        console.log(resp);
      }
    });
  }

  render(){
    if(this.props.liked){
      return(
        <View style={Styles.imageCardStyle}>
                        
         

          <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
            <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
                <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
                <TouchableOpacity onPress={this._onPressButton} style={{paddingRight:10}}>
                    <Image
                      style={{width:20, height:20, tintColor:"darkgray"}}
                      source={require('./image_assets/reply_image.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this._likeRant()}} style={{paddingRight:10, paddingLeft:10}} underlayColor='gray'>
                    <IconMaterial name="heart" size={20} color="red"></IconMaterial>
                  </TouchableOpacity>

              </View>
            </View>

            <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
              <Text>{this.props.content}</Text>
            </View>
            
            
          </View>
          <View style={Styles.imageSectionStyle}>
              
              <Image style={Styles.imageStyle} source ={{uri: this.props.url}}></Image>
              {console.log(this.props.url)}
          </View>
        </View>
      );
    }
    else{
      return(
        <View style={Styles.imageCardStyle}>
                        
          

          <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
            <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
                <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
                <TouchableOpacity onPress={this._onPressButton} style={{paddingRight:10}}>
                    <Image
                      style={{width:20, height:20, tintColor:"darkgray"}}
                      source={require('./image_assets/reply_image.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this._likeRant()}} style={{paddingRight:10, paddingLeft:10}} underlayColor='gray'>
                    <IconMaterial name="heart-outline" size={20} color="darkgray"></IconMaterial>
                  </TouchableOpacity>

              </View>
            </View>

            <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
              <Text>{this.props.content}</Text>
            </View>
            
            
          </View>
          <View style={Styles.imageSectionStyle}>
              
              <Image style={Styles.imageStyle} source ={{uri: this.props.url}}></Image>
              {console.log(this.props.url)}
          </View>
        </View>
      );
    }
  }
}

class TimelineComponent extends PureComponent{
  constructor(props){
    super(props);
    // this.state = {rants: [], isLoading: true, isRefreshing: false, modalVisible: false}
    // this.state = this.getState().timeline || {};
    console.log("HERE IN TIMELINE", this.props.timeline);
    this.refresh = this.refresh.bind(this);
    this._getActiveGroup = this.refresh.bind(this);
  }

  componentDidMount(){
    console.log("HERE MOUNTING COMPONENT AGSin",this.props.userId, this.props.activeGroup)
    console.log("THIS IS THE APP CONTEXT", this.context);
    if(this.props.activeGroup && this.props.userId){
      Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId)
      .then((response) =>{
        store.dispatch(mountTimeline(response.res));
        // this.setState(store.getState().timeline);
      })
      .catch((err)=>{
        console.log( err);
      });
    }
    else{
      store.dispatch(stopLoadingTimeline());
      // this.setState(store.getState().timeline);
    }

  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.activeGroup != prevProps.activeGroup){
      console.log("HERE in COMPONENT");
      this.refresh()
    }
  }


  loadMoreData(continueFrom){
    console.log("WE ARE LOADING MORE DATA");
    Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId, continueFrom)
    .then((response) =>{
      console.log(response);
      store.dispatch(loadMoreTimeline(response.res));
      // this.setState(store.getState().timeline);
    })
    .catch((err)=>{
      console.log(err);
    });
  }



  refresh(){
    console.log("HERE1",this.props.activeGroup);
    store.dispatch(refreshTimeline());
    // this.setState(store.getState().timeline);

    Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId)
    .then((response) =>{
      store.dispatch(stopRefreshing());
      console.log("I HAVE GOTTEN RANTS FROM GROUP",response.res, this.props.activeGroup);
      if(response.res.length>0){
          console.log("THIS IS BEING CALLED");
          store.dispatch(refreshCompleted(response.res));
          // this.setState(store.getState().timeline);
      }
      else{
        console.log("THERE WAS NOTHOING");
        store.dispatch(refreshCompleted([]));
        // this.setState(store.getState().timeline);
      }
    
    })
    .catch((err)=>{ 
      console.log(err);
    });
  }

  

  render(){
    if(!this.props.timeline.isLoading && this.props.timeline.rants.length>0){
      return(
        
        <View style={Styles.singlePageStyle}>

          <FlatList
            data = {this.props.timeline.rants}
            keyExtractor= {item => item.rant_id}
            renderItem = {({item, index}) =>{  
                if(item.image_url){
                  // root 0 means that it is coming from rant page
                  return(
                    <ImageCardComponent root={0} index={index} url={item.image_url} pseudonym={item.pseudonym} date={item.rant_date} content={item.rant_content} groupId={this.props.activeGroup} userId= {this.props.userId} rantId= {item.rant_id} liked= {item.liked_by_user}/>
                  )
                }
                else{
                  return(
                    <CardComponent root={0} index={index} url={item.image_url} pseudonym={item.pseudonym} date={item.rant_date} content={item.rant_content} groupId={this.props.activeGroup} userId= {this.props.userId} rantId= {item.rant_id} liked={item.liked_by_user}/>
                  )
                }
            }}
            onEndReachedThreshold = {0}
            onEndReached = {(number) => {this.loadMoreData(this.props.timeline.rants[this.props.timeline.rants.length-1].rant_id)}}
            refreshing = {this.props.timeline.isRefreshing}
            onRefresh = {()=> {this.refresh()}}
          /> 
        </View>
      );
    }

    else if(this.props.timeline.isLoading){
      return(
        <View style={Styles.loadingPageStyle}>
          <ActivityIndicator size="large" color="darkgray" />
        </View>

      );
    }
    else{
      return(
        <View style={Styles.singlePageStyle}>
          <FlatList
            data = {[]}
            refreshing = {this.props.timeline.isRefreshing}
            onRefresh = {()=> {this.refresh()}}
            />
        </View>
      );
    }
  }
}

class RantScreenComponent extends PureComponent{
  constructor(props){
    super(props);
    this.state = {rantContent: "", pseudonym: ""};
    this.clearState = this.clearState.bind(this);
  }

  clearState(){
    this.setState({rantContent:"", pseudonym: ""});
    this.rantContent.clear();
    this.pseudonym.clear();
    
    setTimeout(()=>{
      this.props.goHome();
    }, 500);
    
  }

  render(){
    return(
      <View style={{flex:1, margin:5, marginBottom:2}}>
          
          <RantNavBarComponent title="" clearState={this.clearState} navBarStyle={Styles.navBarStyle} rantContent ={this.state.rantContent} pseudonym = {this.state.pseudonym} userId={this.props.userId} rantId = {this.props.rantId}  groupId ={this.props.groupId}/>
          
          <View style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', paddingTop:20}}>
            
              <ScrollView scrollEnabled={false} contentContainerStyle={{flex:1}} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="never">
                <TextInput 
                  ref={input => { this.pseudonym = input }} 
                  style={{borderBottomWidth:1, borderBottomColor:'gainsboro', paddingTop:0, padding:15, paddingBottom:20}}
                  placeholder = "Pseudonym"
                  blurOnSubmit={false}
                  onChangeText = {(text)=>{
                    this.setState({...this.state, pseudonym:text})
                  }}
                />
                <TextInput
                  ref={input => { this.rantContent = input }} 
                  style={{flex:1,borderBottomWidth:1, borderBottomColor:'gainsboro', padding:15, paddingTop:20, paddingBottom:20}}
                  multiline= {true}
                  text = "Hello" // Inherit any props passed to it; e.g., multiline, numberOfLines below
                  editable = {true}
                  
                  placeholder = "Speak your mind ..."
                  blurOnSubmit={false}
                  onChangeText = {(text)=>{
                    this.setState({...this.state, rantContent:text});
                  }}
                />
              </ScrollView>
              

              {/* <Button title="Send Rant" onPress={()=>{}}>Send Rant</Button> */}
              {/* <View style={{height:40, borderTopWidth:1, borderBottomWidth:1, borderColor:'gainsboro', alignItems:'flex-end'}}>
                <Button title="Send" onPress={()=>{}} style={{backgroundColor:'gainsboro'}}></Button>
              </View>
              <View style={{height:70}}/> */}
            
              <View style={{height:68}} /> 
          
              
              
           
          </View>
        </View>
    );
  }
}

class FooterComponent extends PureComponent{
  render(){
    return(
      <View style={{height:42, borderTopWidth:1, borderTopColor: 'gainsboro', backgroundColor: 'whitesmoke', flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:10}}>
        <TouchableOpacity onPress={()=>{this.props.goToSlide(0)}} style={{padding:20}}>
          <Image
            style={{width:22, height:22, tintColor:this.props.highlights[0]    }}
            source={require('./image_assets/home_image.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{this.props.goToSlide(1)}} style={{padding:20}}>
          <Image
            style={{width:25, height:25, tintColor:this.props.highlights[2]}}
            source={require('./image_assets/download_image.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{this.props.goToSlide(2)}} style={{padding:20}}>
          <Image
            style={{width:22, height:22, tintColor:this.props.highlights[1] }}
            source={require('./image_assets/search_image.png')}
          />
        </TouchableOpacity>


      </View>
    );
  }

}

class GroupComponent extends PureComponent{
  constructor(props){
    super(props);
    this._searchGroupsLimit= this._searchGroupsLimit.bind(this);
    this._changeAccessCode = this._changeAccessCode.bind(this);
    this._checkIfGroupAlreadyJoined = this._checkIfGroupAlreadyJoined.bind(this);
    
  }

  componentDidMount(){
    Networking.getMostPopularRants().then((resp)=>{
      store.dispatch(setMostPopularGroups(resp.res));
    });
    Networking.discoverGroups().then((resp)=>{
      store.dispatch(setDiscoverGroups(resp.res));
    });
  }
  //ADd search, when user enters something, change groupsJoined state, tap on group and it brings up modal card

  _searchGroupsLimit(query){
    if(query && query.length>=1){
      store.dispatch(startSearchAction(query));
      var timeStarted = Date.now();
      Networking.searchGroupsLimit(query).then((resp)=>{
        store.dispatch(completeSearchAction(timeStarted, resp.res));
      });
    }
    else{
      store.dispatch(startSearchAction(query));
      store.dispatch(completeSearchAction(Date.now(), []));
    }

  }

  async _checkIfGroupAlreadyJoined(groupId){
    
    return new Promise((resolve, reject)=>{
      for(let i=0; i< this.props.groupsJoined.length; i++){
        if(this.props.groupsJoined[i].group_id == groupId){
          console.log(groupId);
          var isGroupAlreadyJoined = true;
          var index= i;
        }
      }
      if(!isGroupAlreadyJoined){
        var isGroupAlreadyJoined=false;
      }
      resolve([isGroupAlreadyJoined, index]);
    });

  }

  _toggleModal(state, groupId){
    this._checkIfGroupAlreadyJoined(groupId).then((resp)=>{
      console.log(resp);  
      if(!resp[0]){
        store.dispatch(toggleModalAction(state, groupId));
      }
      else{
        this.props.changeGroup(resp[1]);
        this.props.swiper.scrollBy(-2, true);
        
      }
    });
  }

  _joinGroup(){
    if(this.props.search.accessCode)
      Networking.joinGroup(this.props.userId, this.props.search.selectedGroupId, this.props.search.accessCode).then(()=>{
        this.props.getGroupsJoined();
        this._toggleModal(false);
        this.props.goToSlide(0);
      })
  }

  _changeAccessCode(text){
    store.dispatch(enteringAccessCode(text));
  }

  render(){
    console.log(this.props.search.query)
    if(this.props.search.query.length > 0)
      return(
        <View style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', paddingTop:5}}>
          <TextInput 
          onChangeText={(text)=>{
            this._searchGroupsLimit(text);
          }} placeholderTextColor="deepskyblue" placeholder='Search ...' style={{ borderBottomWidth:1, color:'deepskyblue', textAlign:'center', height:50, borderColor:'gainsboro', paddingLeft:10, paddingRight:10}}/>
          
          {/* Expand item modal */}
          <Modal
            animationType="fade"
            transparent={true}
            
            visible={this.props.search.modalOpen || false}
            >
            <TouchableWithoutFeedback style={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', padding:22 }} onPress={()=>{this._toggleModal(false)}}>
              
              <View style={{flex:1, padding:20, backgroundColor:'rgba(0,0,0,0.7)'}}>
                {/* <TouchableHighlight onPress={()=>{this._toggleModal(false)}}>
                  <Icon name="x" size={25} color="white"></Icon>
                </TouchableHighlight> */}
                <View style={{flex:1, paddingBottom:47, justifyContent:'center'}}>
                  <View style={{height:200, marginTop:10, borderRadius:5, padding:20, backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
                    <Text style={{fontWeight:'bold', fontSize:20, color:'white'}}>Join Group</Text>
                    <TextInput onChangeText={(text)=>{ this._changeAccessCode(text);  }} placeholder= 'Enter access code ...' placeholderTextColor='white' style={{height:50, color:'white', backgroundColor:'rgba(0, 0, 0, 0.6)', borderRadius:5, marginTop:20, padding:10 }}></TextInput>
                    
                    <TouchableHighlight onPress={()=>{this._joinGroup()}}>
                      <View style={{height:35, marginTop:20, backgroundColor:'deepskyblue', borderRadius:3, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{color:'white', textAlign:'center', alignSelf:'center', fontWeight:'bold'}}>Join</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>

            </TouchableWithoutFeedback>
            
          </Modal>
          <GridView
            itemDiemension={130}
            items={(this.props.search.search) ? this.props.search.search : []}
            contentContainerStyle={{paddingBottom:10}}
            refreshing = {(this.props.search.search) ? this.props.search.isFetching: false}
            renderItem={item => (
              <TouchableHighlight onPress={()=>{this._toggleModal(true, item.group_id) }}>
              <View 
                style={[{justifyContent: 'flex-end',
                borderColor:'gainsboro',
                backgroundColor:'#66d9ff',
                
                borderRadius: 5,
                padding: 10,
                height: 150,
              }, {backgroundColor: item.group_color}]}
              >
                <Text style={{fontSize: 16,
                              color: '#fff',
                              fontWeight: '600'}}
                >{item.group_name}</Text>
                <Text style={{fontWeight:'600', color:'white'}}>{item.members} joins</Text>
              </View>
              </TouchableHighlight>
            
            )
          }
          />
        
        </View>
      );
    else{
      return(
        <View style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', paddingTop:5}}>
          <TextInput 
          onChangeText={(text)=>{
            this._searchGroupsLimit(text);
          }} placeholderTextColor="darkgray" placeholder='Search ...' style={{ borderBottomWidth:1, color:'deepskyblue', textAlign:'center', height:50, borderColor:'gainsboro', paddingLeft:10, paddingRight:10}}/>
          
          {/* Expand item modal */}
          <Modal
            animationType="fade"
            transparent={true}
            
            visible={this.props.search.modalOpen || false}
            >
            <TouchableWithoutFeedback style={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', padding:22 }} onPress={()=>{this._toggleModal(false)}}>
              
              <View style={{flex:1, padding:20, backgroundColor:'rgba(0,0,0,0.7)'}}>
                {/* <TouchableHighlight onPress={()=>{this._toggleModal(false)}}>
                  <Icon name="x" size={25} color="white"></Icon>
                </TouchableHighlight> */}
                <View style={{flex:1, paddingBottom:47, justifyContent:'center'}}>
                  <View style={{height:200, marginTop:10, borderRadius:5, padding:20, backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
                    <Text style={{fontWeight:'bold', fontSize:20, color:'white'}}>Join Group</Text>
                    <TextInput onChangeText={(text)=>{ this._changeAccessCode(text);  }} placeholder= 'Enter access code ...' placeholderTextColor='white' style={{height:50, color:'white', backgroundColor:'rgba(0, 0, 0, 0.6)', borderRadius:5, marginTop:20, padding:10 }}></TextInput>
                    
                    <TouchableHighlight onPress={()=>{this._joinGroup()}}>
                      <View style={{height:35, marginTop:20, backgroundColor:'deepskyblue', borderRadius:3, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{color:'white', textAlign:'center', alignSelf:'center', fontWeight:'bold'}}>Join</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
            
          </Modal>
          <Text style={{color:'deepskyblue', textAlign:'center', paddingTop:20, paddingBottom:10}}>Most Popular Groups</Text>
          <View style={{flex:1}}>
            <GridView
              itemDiemension={130}
              items={this.props.search.mostPopularGroups}
              contentContainerStyle={{paddingRight:10, height:"100%"}}
              refreshing = {(this.props.search.search) ? this.props.search.isFetching: false}
              horizontal={true}
              decelerationRate= {0.92}
              renderItem={item => (
                <TouchableHighlight onPress={()=>{this._toggleModal(true, item.group_id) }}>
                <View 
                  style={[{justifyContent: 'flex-end',
                  borderColor:'gainsboro',
                  backgroundColor:'#66d9ff',
                  borderRadius: 5,
                  padding: 10,
                  width:200,
                  height:"100%",
                }, {backgroundColor: item.group_color}]}
                >
                  <Text style={{fontSize: 16,
                                color: '#fff',
                                fontWeight: '600'}}
                  >{item.group_name}</Text>
                  <Text style={{fontWeight:'600', color:'white'}}>{item.members} joins</Text>
                </View>
                </TouchableHighlight>
              )
            }
            />
          </View>
          <Text style={{color:'deepskyblue', textAlign:'center', paddingTop:20, paddingBottom:10}}>Discover Groups</Text>
          <View style={{flex:1}}>
            <GridView
              itemDiemension={130}
              items={this.props.search.discoverGroups}
              contentContainerStyle={{paddingRight:10, height:"100%"}}
              refreshing = {(this.props.search.search) ? this.props.search.isFetching: false}
              horizontal={true}
              decelerationRate= {0.92}
              renderItem={item => (
                <TouchableHighlight onPress={()=>{this._toggleModal(true, item.group_id) }}>
                <View 
                  style={[{justifyContent: 'flex-end',
                  borderColor:'gainsboro',
                  backgroundColor:'#66d9ff',
                  borderRadius: 5,
                  padding: 10,
                  width:200,
                  height:"100%",
                }, {backgroundColor: item.group_color}]}
                >
                  <Text style={{fontSize: 16,
                                color: '#fff',
                                fontWeight: '600'}}
                  >{item.group_name}</Text>
                  <Text style={{fontWeight:'600', color:'white'}}>{item.members} joins</Text>
                </View>
                </TouchableHighlight>
              )
            }
            />
          </View>
        
        </View>
      );
    }
  }
}

class LikedComponent extends PureComponent{

  constructor(props){
    super(props);
    this._getRantsLikedByUser = this._getRantsLikedByUser.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.groupId != prevProps.groupId){
      this._getRantsLikedByUser();
    }
  }

  componentDidMount(){
    this._getRantsLikedByUser();
  }


  _getRantsLikedByUser(continueFrom){
    // IF WE ARE REFRESHING SET REFRESHING TO TRUE
    if(!continueFrom)
      store.dispatch(startGettingRantsLiked());

    responseJson = Networking.getRantsLikedByUser(this.props.userId, continueFrom, this.props.groupId).then((resp)=>{
    // IF NOT CONTINUING, WE ARE DOING A FULL REFRESH
      if(!continueFrom){
        store.dispatch(setRantsLikedByUser(resp.res));
      }
      else{
        store.dispatch(loadMoreRantsLiked(resp.res));
      }
    });
  }


  render(){
    console.log("RANTS LIKED", this.props.rantsLiked.rantsLiked);
    return(
      <View style={Styles.singlePageStyle}>
        <FlatList
          data = {this.props.rantsLiked.rantsLiked}
          keyExtractor= {item => item.rant_id}
          renderItem = {({item, index}) => {
              console.log(item.unliked);
              if(item.image_url){
                console.log(item.unliked);
                return(
                  // root 1 means it is coming from likes page
                  
                  <ImageCardComponent root={1} index={index} url={item.image_url} pseudonym={item.pseudonym} date={item.rant_date} content={item.rant_content} groupId={this.props.groupId} userId= {this.props.userId} rantId= {item.rant_id} liked={item.unliked? false:true }/>
                )
              }
              else{
                return(
                  <CardComponent root={1} index={index} url={item.image_url} pseudonym={item.pseudonym} date={item.rant_date} content={item.rant_content} groupId={this.props.groupId} userId= {this.props.userId} rantId= {item.rant_id} liked={item.unliked? false:true }/>
                )
              }
          }}
          onEndReachedThreshold = {0}
          onEndReached = {(number) => {
              if(this.props.rantsLiked.length>0){
                this._getRantsLikedByUser(this.props.rantsLiked.rantsLiked[this.props.rantsLiked.rantsLiked.length-1].rant_like_id);
              }
            }
          }
          refreshing = {this.props.rantsLiked.isRefreshing}
          onRefresh = {()=> {this._getRantsLikedByUser()}}
        /> 
      </View>
    );
  }
}

class SettingsModal extends PureComponent{
  render(){
    return(
      <Modal
          animationType="slide"
          transparent={true}
          
          visible={this.props.modalVisible}
          >
          <View style={{flex:1, backgroundColor:'rgba(0, 0, 0, 0.8)', padding:20, paddingTop:22}}>
            <TouchableHighlight
                onPress={() => {
                  this.props.modalCloseAction(!this.props.modalVisible);
                }}>
                <Icon name="x" size={25} color="white"/>
            </TouchableHighlight>
            <TouchableWithoutFeedback style={{flex:1}} onPress={()=>{this.props.modalCloseAction(!this.props.modalVisible);}}>
                <View style={{flex:1, justifyContent:'center', paddingBottom:47}}>
                  {/* GROUP SECTION */}
                  <View style={{borderRadius:10, backgroundColor:'rgba(0, 0, 0, 0.5)', height:200, marginTop:30, padding:15  }}>
                      <Text style={{fontWeight:'bold', fontSize:20, color:'white'}}>Groups</Text>
                      <ScrollView horizontal={true} contentContainerStyle={{flexDirection:'row', justifyContent:'center'}}> 
                        
                        <GridView
                          itemDiemension={130}
                          items={this.props.groupsJoined}
                          contentContainerStyle={{flex:1, padding:0, paddingTop:15}}
                          horizontal= {true}
                          renderItem={item =>{
                            
                            if(item.group_id == this.props.activeGroup){
                              return(
                                <TouchableWithoutFeedback style={{flex:1}}>
                                  <View style={{flex:1}}>
                                    <View
                                      style={[{
                                        justifyContent: 'flex-end',
                                        borderColor:'gainsboro',
                                        backgroundColor:'#66d9ff',
                                        borderRadius: 5,
                                        padding: 10,
                                        height: 90,
                                        width: 90}, {backgroundColor: item.group_color
                                      }]}> 
                                    <Text style={{fontSize: 16,
                                                  color: '#fff',
                                                  fontWeight: '600'}}
                                    >{(item.group_name.length > 15) ? item.group_name.substring(0, 11) + ' ... ' : item.group_name}</Text>
                                    <Text style={{fontWeight:'600', color:'white'}}>{item.members} joins</Text>
                                  </View>
                                  <View style={{position:'absolute', justifyContent:'flex-end', alignItems:'flex-end', borderRadius:5, height:90, width:90, flex:1, backgroundColor:'rgba(0,0,0,0.3)', padding:5}}>
                                      <Icon name='check' size={25} color="white"/>
                                  </View>
                                </View>
                              </TouchableWithoutFeedback>
                              
                              );   
                            }

                            else{
                              return(
                                <TouchableHighlight onPress={()=>{this.props.changeGroupFunction(item.arrIndex)}} style={{flex:1}}>
                                  <View 
                                    style={[{
                                      justifyContent: 'flex-end',
                                      borderColor:'gainsboro',
                                      backgroundColor:'#66d9ff',
                                      
                                      borderRadius: 5,
                                      padding: 10,
                                      height: 90,
                                      width: 90}, {backgroundColor: item.group_color
                                    }]}
                                  >
                                    <Text style={{fontSize: 16,
                                                  color: '#fff',
                                                  fontWeight: '600'}}
                                    >{(item.group_name.length > 15) ? item.group_name.substring(0, 11) + ' ... ' : item.group_name}</Text>
                                    <Text style={{fontWeight:'600', color:'white'}}>{item.members} joins</Text>
                                  </View>
                                </TouchableHighlight>
                                ); 
                            }
                          
                        }
                        }
                        />
                      </ScrollView>
                  </View>

                  {/* THEME COLOR SECTION */}
                  <View style={{borderRadius:10, backgroundColor:'rgba(0, 0, 0, 0.5)', height:200, marginTop:30, padding:15  }}>
                      <Text style={{fontWeight:'bold', fontSize:20, color:'white'}}>Theme Color</Text>
                      <ScrollView horizontal={true} contentContainerStyle={{flexDirection:'row', justifyContent:'center'}}> 
                        
                        <GridView
                          itemDiemension={130}
                          items={['deepskyblue', 'blueviolet', 'darkslategray', 'dodgerblue', 'firebrick']}
                          contentContainerStyle={{flex:1, padding:0, paddingTop:15}}
                          horizontal= {true}
                          renderItem={item => (
                          <TouchableHighlight>
                            <View
                              style={[{justifyContent: 'flex-end',
                              borderColor:'gainsboro',
                              backgroundColor:'#66d9ff',
                              
                              borderRadius: 5,
                              padding: 10,
                              height: 90,
                              width: 90}, {backgroundColor: item}]}
                            >
                            
                            </View>
                          </TouchableHighlight>
                          
                          )

                        }
                        />
                      </ScrollView>

                  </View>
              </View>
            </TouchableWithoutFeedback>
          </View>

        </Modal>
    );
  }
}



class DisplayComponent extends Component {
  constructor(props){
    super(props);
    this.state = {currentScreen: "Personal Rants", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: true, isPhoneRegistered: false, verifyingRegistration: false, modalVisible:false, currentMainSectionIndex: 0};
    this._onSwipe = this._onSwipe.bind(this);
    this._submitLogin = this._submitLogin.bind(this);
    this._verifyingRegistration = this._verifyingRegistration.bind(this);
    this._setModalVisible = this._setModalVisible.bind(this)
    this._getGroupsJoined = this._getGroupsJoined.bind(this);
    this._changeGroup = this._changeGroup.bind(this);
    this._goHome = this._goHome.bind(this);
    this._goToRants = this._goToRants.bind(this);
    this._goToSlide = this._goToSlide.bind(this);
    this._onSwipeMain = this._onSwipeMain.bind(this);
  }

  componentDidMount(){
    Networking.checkIfPhoneIsRegistered()
    .then((resp)=>{
      this.setState({...this.state, currentScreen: "Personal Rants", footer: ['deepskyblue', 'darkgray', 'darkgray'], isPhoneRegistered: true, userId: resp})
      this._getGroupsJoined();
    })
    .catch((err) => {
      this.setState({currentScreen: "Personal Rants", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration:false});
      console.log(err)
    });
  }

  _onSwipeMain(e, state, context){
    switch(state.index){
      case 0:
        this.refs.rantScreen.rantContent.focus();
        break;
      case 1:
        this.refs.rantScreen.pseudonym.blur();
        this.refs.rantScreen.rantContent.blur();
        Keyboard.dismiss();
        break;

    } 
  }

  _onSwipe(e, state, context){
    Keyboard.dismiss();
    switch(state.index){
      case 0:
        this.setState((previousState)=>{return {...previousState, currentMainSectionIndex: state.index, currentScreen: (this.state.groupsJoined[this.state.activeGroupIndex]) ? ((this.state.groupsJoined[this.state.activeGroupIndex].group_name.length < 15) ? this.state.groupsJoined[this.state.activeGroupIndex].group_name :  this.state.groupsJoined[this.state.activeGroupIndex].group_name.substring(0,12)+" ... ") : "Join A Group :) ->", footer:['deepskyblue', 'darkgray', 'darkgray']}});
        break;
      case 1:
        this.setState((previousState)=>{return{...previousState, currentMainSectionIndex: state.index, currentScreen: "Liked", footer:['darkgray', 'darkgray','deepskyblue']}});
        break;
      case 2:
        this.setState((previousState)=>{return {...previousState, currentMainSectionIndex: state.index, currentScreen: "Search Groups", footer:['darkgray', 'deepskyblue', 'darkgray']}});
        break;
      
      default:
        this.setState((previousState)=>{return{...previousState, currentMainSectionIndex: state.index, currentScreen: "Home", footer:['deepskyblue', 'darkgray', 'darkgray']}});
    }
  }

  


  _dismissKeyboard(){
    Keyboard.dismiss();
  }


  _submitLogin(){
    console.log(this.state.email);
    Networking.register(this.state.email, this.state.pseudonym)
    .then((resp)=>{
      this.refs['emailField'].setNativeProps({text: ''});
      this.setState( (previousState)=>{                            
        return {currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration: true , email: "", pseudonym: previousState.pseudonym||"", receivedUserId: resp.userId};
      });
    })
    .catch((resp)=>{
      // DISPLAY ERROR MESSAGE
      console.log(resp); 
    });
  }

  _verifyingRegistration(){
    if(this.state.inputtedId == ""+this.state.receivedUserId){
      console.log("Correct");
      Networking.registerPhone(this.state.receivedUserId)
      .then((resp)=>{
        console.log(resp);
        this.setState({...this.state, currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], verifyingRegistration:false, userId:this.state.receivedUserId})
        this._getGroupsJoined();
      })
      .catch((err)=>{
        console.log(err);
        this.refs['userIdField'].setNativeProps({text: ''});
        this.setState({currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration:false});

      })
      return true;
    }
    else{
      console.log(this.state.inputtedId);
      console.log(this.state.receivedUserId);
      this.refs['userIdField'].setNativeProps({text: ''});
      this.setState({currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration:false});
      return false;
    }
  }

  _setModalVisible(visible){
    this.setState({...this.state, modalVisible:visible});
  }

  _changeGroup(index){
    this.setState({...this.state, activeGroupIndex:index, currentScreen: (this.state.groupsJoined[index].group_name.length<15) ? this.state.groupsJoined[index].group_name : this.state.groupsJoined[index].group_name.substring(0, 12)+ " ... " });
  }

  _goHome(){
    Keyboard.dismiss();
    this.refs.mainSwiper.scrollBy(1);
  }

  _goToRants(){
    Keyboard.dismiss();
    this.refs.mainSwiper.scrollBy(-1);
  }

  _goToSlide(index){
    console.log("HERE");
    if(this.state.currentMainSectionIndex){
      
      var difference = index - this.state.currentMainSectionIndex;
      console.log("O di kwa difference", difference);
      this.refs.secondarySwiper.scrollBy(difference);
    }
    else{
      this.refs.secondarySwiper.scrollBy(index);
    }
  }
  _getGroupsJoined(){
    Networking.getGroupsJoined(this.state.userId).then((resp)=>{
      resp.res = resp.res.map((currentValue,index, arr)=>{
        return {...currentValue, arrIndex:index};
      });
      if(resp.res[0])
        this.setState({...this.state, currentScreen: (resp.res[0].group_name.length<15) ? resp.res[0].group_name : resp.res[0].group_name.substring(0,12)+" ... " , groupsJoined: resp.res, activeGroupIndex:0, confirmingLogin: false, isPhoneRegistered: true,});
      else
        this.setState({...this.state, currentScreen: "Join A Group :) ->", groupsJoined: resp.res, activeGroupIndex:0, confirmingLogin: false, isPhoneRegistered: true,});
    })
  }

  


  render() {
    console.log("THIS IS THE STOREEEE",this.props.timeline);
    if(this.state.confirmingLogin){
      return(
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text style={{color:'gainsboro', fontSize:21, textAlign:'center'}}> We are setting up Atio. {'\n'} Please ensure you are connected to internet</Text>
        </View>
      )
    }
    else{

      if(this.state.isPhoneRegistered){
        
        return ( 
            
            <View style = {{flex: 1, backgroundColor:'deepskyblue'}}>
              {console.log("THIS IS THE STORE", this.store)}
              <StatusBar backgroundColor="skyblue" barStyle="light-content" />

              <Swiper ref="mainSwiper" loop={false} index={1} showsPagination={false} keyboardDismissMode="on-drag" onMomentumScrollEnd={this._onSwipeMain}>
                  <RantScreenComponent ref="rantScreen" goHome={this._goHome} groupId = {(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} userId = {this.state.userId || null}/>

                  <View style={{flex:1}}>
                    <NavBarComponent title={this.state.currentScreen} navBarStyle={Styles.navBarStyle} showIcons={true} onPressRightButton={()=>{this._setModalVisible(true)}} onPressLeftButton ={()=>{this._goToRants()}} ></NavBarComponent>
                    
                    {/* SETTINGS MODAL */}
                    <SettingsModal modalVisible={this.state.modalVisible} groupsJoined={this.state.groupsJoined || []} modalCloseAction = {this._setModalVisible} activeGroup={(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} changeGroupFunction = {this._changeGroup}/>
                    <Swiper ref="secondarySwiper" index={0} showsPagination={false} onMomentumScrollEnd = {this._onSwipe} keyboardDismissMode="on-drag" loop={false} >
                      <TimelineComponent ref="timeline" timeline={this.props.timeline} activeGroup = {(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} userId = {this.state.userId || null}/>
                      <LikedComponent ref="likedRants" rantsLiked={this.props.rantsLikedByUser} userId={this.state.userId} groupId = {(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} />
                      <GroupComponent search={this.props.search} goToSlide = {this._goToSlide} userId={this.state.userId} groupsJoined = {this.state.groupsJoined} getGroupsJoined = {this._getGroupsJoined} swiper ={this.refs.secondarySwiper} changeGroup={this._changeGroup}/>
                      
                    </Swiper>
                    <FooterComponent highlights= {this.state.footer} goToSlide= {this._goToSlide}/>
                  </View>
              </Swiper>
            </View>
        );
      }
      else if(!this.state.verifyingRegistration){
        return(
          <View style = {{flex: 1, backgroundColor:'deepskyblue'}}>
              <StatusBar backgroundColor="skyblue" barStyle="light-content" />
              <NavBarComponent title="Setup" navBarStyle={Styles.navBarStyle} showIcons = {false}></NavBarComponent>
              <KeyboardAwareScrollView contentContainerStyle={{flexGrow:1, flexDirection:'column'}}  resetScrollToCoords={{ x: 0, y: 0 }}>
              <View style={{flex:1, flexDirection:'column', borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', margin:5, marginTop:0, paddingTop:5}}>
                {/* <Text style={{padding:10, fontSize:20, textAlign:'center', color:'gray'}}>Welcome to Atio, the anonymous ranting platform</Text> */}
                <View style={{flex:1, justifyContent:'center'}}>
                  <Image
                    style={{width: 150, height: 150, alignSelf:'center', tintColor:'deepskyblue'}}
                    source= {require('./image_assets/atio_image.png')}
                  />
                </View>
                <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
                  <View style={{flex:1, flexDirection:'column'}}>
                    <View>
                      
                    
                      <TextInput ref={'emailField'} spellCheck={false} onChangeText={(text)=>{
                        this.setState((previousState)=>{
                          return {currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration: previousState.verifyingRegistration , email: text, pseudonym: previousState.pseudonym||""}
                        });
                        }} enablesReturnKeyAutomatically={true} returnKeyType="done" placeholder="Enter your email ..." placeholderTextColor="deepskyblue" style={{borderTopWidth:1, color:'deepskyblue', textAlign:'center', borderBottomWidth:1, height:55, borderColor:'gainsboro', paddingLeft:10, paddingRight:10}}/>
                      <TextInput onChangeText={(text)=>{
                        this.setState((previousState)=>{

                          return {currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration: previousState.verifyingRegistration , email: previousState.email||"", pseudonym: text}
                        });
                        }} enablesReturnKeyAutomatically={true} returnKeyType="send" placeholder="Enter your desired pseudonym ..." placeholderTextColor="deepskyblue" style={{ borderBottomWidth:1, color:'deepskyblue', textAlign:'center', height:55, borderColor:'gainsboro', paddingLeft:10, paddingRight:10}} 
                        onSubmitEditing={()=>{
                          this._submitLogin();
                        }}/>
                      <Text style={{paddingTop:20 , textAlign:'center', color:'gray'}}>Where's the password field? </Text>
                    </View>
                  </View>
                </KeyboardAvoidingView>
            
              </View>
              </KeyboardAwareScrollView>
          </View>

        );
      }
      else{
        return(
          <View style = {{flex: 1, backgroundColor:'deepskyblue'}}>
              <StatusBar backgroundColor="skyblue" barStyle="light-content" />
              <NavBarComponent title="Setup" navBarStyle={Styles.navBarStyle} showIcons = {false}></NavBarComponent>
              <KeyboardAwareScrollView contentContainerStyle={{flexGrow:1, flexDirection:'column'}}  resetScrollToCoords={{ x: 0, y: 0 }}>
              <View style={{flex:1, flexDirection:'column', borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', margin:5, marginTop:0, paddingTop:5}}>
                {/* <Text style={{padding:10, fontSize:20, textAlign:'center', color:'gray'}}>Welcome to Atio, the anonymous ranting platform</Text> */}
                <View style={{flex:1, justifyContent:'center'}}>
                  <Image
                    style={{width: 150, height: 150, alignSelf:'center', tintColor:'deepskyblue'}}
                    source= {require('./image_assets/atio_image.png')}
                  />
                </View>
                <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
                  <View style={{flex:1, flexDirection:'column'}}>
                    <View>

                      <TextInput ref={'userIdField'} onChangeText={(text)=>{
                          this.setState((previousState)=>{
                            return {currentScreen: "Home", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: false, isPhoneRegistered: false, verifyingRegistration: previousState.verifyingRegistration , email: previousState.email||"", pseudonym: previousState.pseudonym||"", receivedUserId: previousState.receivedUserId||"", inputtedId:text }
                          });
                        }} 
                        enablesReturnKeyAutomatically={true} returnKeyType="send" placeholder="Enter the number received in email ..." placeholderTextColor="deepskyblue" style={{ borderBottomWidth:1, color:'deepskyblue', textAlign:'center', height:55, borderColor:'gainsboro', paddingLeft:10, paddingRight:10}} 
                        onSubmitEditing={()=>{
                          this._verifyingRegistration();
                        }}/>

                      <Text style={{paddingTop:20 , textAlign:'center', color:'gray'}}>What are we asking for? </Text>
                    </View>
                  </View>
                </KeyboardAvoidingView>
            
              </View>
              </KeyboardAwareScrollView>
          </View>
        );
      }
    }
  }
}






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
  console.log("HERE AGAIN", state.rantsLikedByUser);
  return { 
    timeline: state.timeline, 
    rantsLikedByUser: state.rantsLikedByUser,
    search: state.search
  };
}
AppComponent = connect(mapStateToProps)(DisplayComponent);
      
      
        
      
    
