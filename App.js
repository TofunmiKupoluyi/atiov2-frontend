
import React, {PureComponent ,Component } from 'react';
import { Modal, FlatList, StyleSheet, Text, View, StatusBar, Image, TouchableHighlight, TouchableWithoutFeedback, ActivityIndicator, TextInput, Keyboard, KeyboardAvoidingView, Button, ScrollView, AsyncStorage } from 'react-native';
import { createStore } from 'redux';
import Swiper from 'react-native-swiper';
import GridView from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/Feather'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import store, {startSearchAction, completeSearchAction, toggleModalAction, enteringAccessCode} from './reduxScripts'


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
    borderBottomWidth:1,
    borderBottomColor:'gainsboro',
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    overflow:'hidden'
    
  },
  imageStyle: {
    flex:1,  
    
  }

})



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
      console.log(returnedValue);
      if(returnedValue){
        let responseJson = await returnedValue.json();
        return new Promise((resolve, reject)=>{
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
          <TouchableHighlight onPress={this.props.onPressLeftButton} style={{padding:20}}>
            
            <Icon name="feather" size={20} color="white" />
          </TouchableHighlight>
          <Text style={{fontWeight:'bold',  fontSize:18, color:'white'}}>{this.props.title}</Text>
          <TouchableHighlight onPress = {this.props.onPressRightButton} style={{padding:20}}>
            
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

  render(){
    return(
      <View style = {{paddingTop: 22, height: 70, backgroundColor: 'deepskyblue', flex:0, flexDirection:'row', alignItems:'center'}} >

        <View style={{ flex:1}}/>
        <View style={{flex:1}}>
          <Text style={{fontWeight:'bold',  fontSize:18, color:'white', textAlign:'center'}}>Rant</Text> 
        </View>
        <View style={{flex:1}}>
          <View style={{ backgroundColor:"white", margin:10, padding:10, borderRadius:20}} onPress={()=>{}}>
            <Text style={{color:"deepskyblue", fontWeight:"bold", fontSize:15, textAlign:'center'}}>Post</Text>
          </View>
        </View>
       
      </View>
    );
  }
}

class CardComponent extends PureComponent{
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

  render(){
    return(
      <View style={Styles.cardStyle}>
        <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
          <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
            <View style={{flexDirection:"row"}}>
              <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
              <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
            </View>
            <View style={{flexDirection:"row"}}>
              <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10}}>
                <Image
                  style={{width:20, height:20, tintColor:"darkgray"}}
                  source={require('./image_assets/reply_image.png')}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10, paddingLeft:10}}>
                <Image
                  style={{width:20, height:20, tintColor:"darkgray"}}
                  source={require('./image_assets/heart_image.png')}
                />
              </TouchableHighlight>
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

class ImageCardComponent extends PureComponent{
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

  render(){
    return(
      <View style={Styles.imageCardStyle}>
                      
        <View style={Styles.imageSectionStyle}>
            
            <Image style={Styles.imageStyle} source ={{uri: this.props.url}}></Image>
            {console.log(this.props.url)}
        </View>

        <View style={{flex:10, paddingTop:10, paddingBottom:10}}>
          <View style = {{flexDirection:'row', justifyContent:"space-between", padding:5, paddingLeft:15}}>
            <View style={{flexDirection:"row"}}>
              <Text style={{fontWeight: "bold"}}>{this.props.pseudonym}</Text>
              <Text style={{color:'darkgray'}}> . {this.generateTime(new Date(this.props.date))}</Text>
            </View>
            <View style={{flexDirection:"row"}}>
              <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10}}>
                <Image
                  style={{width:20, height:20, tintColor:"darkgray"}}
                  source={require('./image_assets/reply_image.png')}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={this._onPressButton} style={{paddingRight:10, paddingLeft:10}}>
                <Image
                  style={{width:20, height:20, tintColor:"darkgray"}}
                  source={require('./image_assets/heart_image.png')}
                />
              </TouchableHighlight>
            </View>
          </View>

          <View style = {{flexDirection:'row', padding:5, paddingLeft:15, marginRight:15 }}>
            <Text>{this.props.content}</Text>
          </View>
          
          
        </View>
      </View>
    );
  }
}

class TimelineComponent extends PureComponent{
  constructor(props){
    super(props);
    this.state = {rants: [], isLoading: true, isRefreshing: false, modalVisible: false}
    this.refresh = this.refresh.bind(this);
    this._getActiveGroup = this.refresh.bind(this);
  }

  componentDidMount(){
    console.log("HERE",this.props.userId, this.props.activeGroup)

    if(this.props.activeGroup && this.props.userId)
      Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId)
      .then((response) =>{
        this.setState((previousState) => {return {rants: response.res, isLoading: false, isRefreshing: false, modalVisible: previousState.modalVisible}}); 
      })
      .catch((err)=>{
        console.log( err);
      });
    
    else{
      this.setState({...this.state, isLoading:false})
    }

  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.activeGroup != prevProps.activeGroup){
      this.refresh()
    }
  }


  loadMoreData(continueFrom){
    Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId, continueFrom)
    .then((response) =>{
      this.setState({rants: [...this.state.rants, ... response.res], isLoading: false, isRefreshing: false, modalVisible:false});
    })
    .catch((err)=>{
      console.log(err);
    });
  }



  refresh(){
    console.log(this.state.isRefreshing);
    this.state.isRefreshing=true;
    Networking.getRantsFromGroup(this.props.activeGroup, this.props.userId)
    .then((response) =>{
      if(response.res.length>0){
        if(!( (this.state.rants[0]) && (this.state.rants[0].rant_id == response.res[0].rant_id) ))
          this.setState({rants: response.res, isLoading: false, isRefreshing: false, modalVisible:false}); 
      }
      else
        this.setState({rants: response.res, isLoading: false, isRefreshing: false, modalVisible:false}); 
    
    })
    .catch((err)=>{
      
      console.log(err);
    });
  }

  

  render(){
    if(!this.state.isLoading && this.state.rants.length>0){
      return(
        

        <View style={Styles.singlePageStyle}>

          <FlatList
            data = {this.state.rants}
            keyExtractor= {item => item.rant_id}
            renderItem = {(obj) => {
                if(obj.item.image_url){
                  return(
                    <ImageCardComponent url={obj.item.image_url} pseudonym={obj.item.pseudonym} date={obj.item.rant_date} content={obj.item.rant_content}/>
                  )
                }
                else{
                  return(
                    <CardComponent url={obj.item.image_url} pseudonym={obj.item.pseudonym} date={obj.item.rant_date} content={obj.item.rant_content}/>
                  )
                }
            }}
            onEndReachedThreshold = {0}
            onEndReached = {(number) => {this.loadMoreData(this.state.rants[this.state.rants.length-1].rant_id)}}
            refreshing = {this.state.isRefreshing}
            onRefresh = {()=> {this.refresh()}}
          /> 
        </View>
      );
    }

    else if(this.state.isLoading ){
      return(
        <View style={Styles.loadingPageStyle}>
          <ActivityIndicator size="large" color="skyblue" />
        </View>

      );
    }
    else{
      return(
        <View style={Styles.singlePageStyle}>
          <FlatList
            data = {[]}
            refreshing = {this.state.isRefreshing}
            onRefresh = {()=> {this.refresh()}}
            />
        </View>
      );
    }
  }
}

class RantScreenComponent extends PureComponent{
  render(){
    return(
      <View style={{flex:1, margin:5, marginBottom:2}}>
          <RantNavBarComponent title="" navBarStyle={Styles.navBarStyle}/>
          <View style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', paddingTop:5}}>
            <KeyboardAvoidingView
              style={{flex:1, paddingTop:15, justifyContent:"space-between"}}
              behavior="padding"
            >
              <View style={{flex:1}}>
                <TextInput 
                  style={{borderBottomWidth:1, borderBottomColor:'gainsboro', paddingTop:0, padding:15, paddingBottom:20}}
                  placeholder = "Pseudonym"
                />
                <TextInput
                  style={{flex:1,borderBottomWidth:1, borderBottomColor:'gainsboro', padding:15, paddingTop:20, paddingBottom:20}}
                  multiline= {true}
                  text = "Hello" // Inherit any props passed to it; e.g., multiline, numberOfLines below
                  editable = {true}
                  
                  placeholder = "Speak your mind ..."
                />
              </View>
              

              <View style={{height:100, borderBottomWidth:1, borderBottomColor:'white', flexDirection:"row", alignItems:"center"}}>
                <TouchableHighlight style={{height:80, width: 80, borderWidth: 1, borderColor:'gainsboro', borderRadius:15, marginLeft:10, justifyContent:"center", alignItems:"center"}}>
                    <Image
                      style={{width:50, height:50, tintColor:"white"}}
                      source={require('./image_assets/add_image.png')}
                    />
                </TouchableHighlight>
                <TouchableHighlight style={{height:80, width: 80, borderWidth: 1, borderColor:'gainsboro', borderRadius:15, marginLeft: 10, justifyContent:"center", alignItems:"center"}}>
                  <Image
                    style={{width:50, height:50, tintColor:"white"}}
                    source={require('./image_assets/add_image.png')}
                  />
                </TouchableHighlight>
                
              </View>
              {/* <Button title="Send Rant" onPress={()=>{}}>Send Rant</Button> */}
              {/* <View style={{height:40, borderTopWidth:1, borderBottomWidth:1, borderColor:'gainsboro', alignItems:'flex-end'}}>
                <Button title="Send" onPress={()=>{}} style={{backgroundColor:'gainsboro'}}></Button>
              </View>
              <View style={{height:70}}/> */}
            
              <View style={{height:68}} /> 
          
              
              
            </KeyboardAvoidingView>
          </View>
        </View>
    );
  }
}

class FooterComponent extends PureComponent{
  render(){
    return(
      <View style={{height:42, borderTopWidth:1, borderTopColor: 'gainsboro', backgroundColor: 'whitesmoke', flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:10}}>
        <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
          <Image
            style={{width:22, height:22, tintColor:this.props.highlights[0]    }}
            source={require('./image_assets/home_image.png')}
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
          <Image
            style={{width:22, height:22, tintColor:this.props.highlights[1] }}
            source={require('./image_assets/search_image.png')}
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onPressButton} style={{padding:20}}>
          <Image
            style={{width:25, height:25, tintColor:this.props.highlights[2]}}
            source={require('./image_assets/download_image.png')}
          />
        </TouchableHighlight>

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
    this.state = store.getState() || {};

    console.log(store.getState());
  }


  //ADd search, when user enters something, change groupsJoined state, tap on group and it brings up modal card

  _searchGroupsLimit(query){
    if(query && query.length>=1){
      store.dispatch(startSearchAction(query));
      var timeStarted = Date.now();
      Networking.searchGroupsLimit(query).then((resp)=>{
        store.dispatch(completeSearchAction(timeStarted, resp.res));
        this.setState(store.getState());
      });
    }
    else{
      store.dispatch(startSearchAction(query));
      store.dispatch(completeSearchAction(Date.now(), []));
      this.setState(store.getState());
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
        this.setState(store.getState());
      }
      else{
        this.props.swiper.scrollBy(-1, true);
        this.props.changeGroup(resp[1]);
      }
    });

    
  }

  _joinGroup(){
    if(this.state.accessCode)
      Networking.joinGroup(this.props.userId, this.state.selectedGroupId, this.state.accessCode).then(()=>{
        this.props.getGroupsJoined();
        this._toggleModal(false);
      })
  }

  _changeAccessCode(text){
    store.dispatch(enteringAccessCode(text));
    this.setState(store.getState());
  }

  render(){
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
          
          visible={this.state.modalOpen || false}
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
          items={(this.state.search) ? this.state.search.search : []}
          contentContainerStyle={{paddingBottom:10}}
          refreshing = {(this.state.search) ? this.state.search.isFetching: false}
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

export default class DisplayComponent extends Component {
    constructor(props){
      super(props);
      this.state = {currentScreen: "Personal Rants", footer: ['deepskyblue', 'darkgray', 'darkgray'], confirmingLogin: true, isPhoneRegistered: false, verifyingRegistration: false, modalVisible:false};
      this._onSwipe = this._onSwipe.bind(this);
      this._submitLogin = this._submitLogin.bind(this);
      this._verifyingRegistration = this._verifyingRegistration.bind(this);
      this._setModalVisible = this._setModalVisible.bind(this)
      this._getGroupsJoined = this._getGroupsJoined.bind(this);
      this._changeGroup = this._changeGroup.bind(this);
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

    _onSwipe(e, state, context){
      Keyboard.dismiss();
      switch(state.index){
        case 0:
          this.setState((previousState)=>{return {...previousState, currentScreen: (this.state.groupsJoined[this.state.activeGroupIndex]) ? ((this.state.groupsJoined[this.state.activeGroupIndex].group_name.length < 15) ? this.state.groupsJoined[this.state.activeGroupIndex].group_name :  this.state.groupsJoined[this.state.activeGroupIndex].group_name.substring(0,12)+" ... ") : "Join A Group :) ->", footer:['deepskyblue', 'darkgray', 'darkgray']}});
        
          break;
        case 1:
          this.setState((previousState)=>{return {...previousState, currentScreen: "Search Groups", footer:['darkgray', 'deepskyblue', 'darkgray']}});
          break;
        case 2:
          this.setState((previousState)=>{return{...previousState, currentScreen: "Liked", footer:['darkgray', 'darkgray','deepskyblue']}});
          break;
        default:
          this.setState((previousState)=>{return{...previousState, currentScreen: "Home", footer:['deepskyblue', 'darkgray', 'darkgray']}});
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
      
      if(this.state.confirmingLogin){
        return(
          <View>
          </View>
        )
      }
      else{

        if(this.state.isPhoneRegistered){
          return ( 
              <View style = {{flex: 1, backgroundColor:'deepskyblue'}}>
                <StatusBar backgroundColor="skyblue" barStyle="light-content" />

                <Swiper loop={false} index={1} showsPagination={false} keyboardDismissMode="on-drag" onMomentumScrollEnd={Keyboard.dismiss}>
                    <RantScreenComponent/>

                    <View style={{flex:1}}>
                      <NavBarComponent title={this.state.currentScreen} navBarStyle={Styles.navBarStyle} showIcons={true} onPressRightButton={()=>{this._setModalVisible(true)}} ></NavBarComponent>
                      
                      {/* SETTINGS MODAL */}
                      <SettingsModal modalVisible={this.state.modalVisible} groupsJoined={this.state.groupsJoined || []} modalCloseAction = {this._setModalVisible} activeGroup={(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} changeGroupFunction = {this._changeGroup}/>
                      <Swiper index={0} showsPagination={false} onMomentumScrollEnd = {this._onSwipe} keyboardDismissMode="on-drag" loop={false} ref={(swiper) => {this.swiper = swiper;}}>
                        <TimelineComponent activeGroup = {(this.state.groupsJoined[this.state.activeGroupIndex])? this.state.groupsJoined[this.state.activeGroupIndex].group_id : null} userId = {this.state.userId || null}/>
                        <GroupComponent userId={this.state.userId} groupsJoined = {this.state.groupsJoined} getGroupsJoined = {this._getGroupsJoined} swiper ={this.swiper} changeGroup={this._changeGroup}/>
                        <View style={{flex:1, borderTopLeftRadius:10, borderTopRightRadius:10, backgroundColor:'white', overflow:'hidden', paddingTop:5}}>
                        </View>
                        
                      </Swiper>
                      <FooterComponent highlights= {this.state.footer}/>
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
        
      
      
        
      
    
