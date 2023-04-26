import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {MediaStream, RTCView, mediaDevices} from 'react-native-webrtc';
import Button from './Button';
import {useEffect} from 'react';

const ButtonCotainer = ({hang}) => {
  return (
    <View style={styles.bContainer}>
      <Button text="reject" onPress={hang} />
    </View>
  );
};

const Video = ({localStream, remoteStream, hang}) => {
  if (localStream && remoteStream){
    return (
      <View style={styles.container}>
        <RTCView
          mirror
          streamURL={localStream.toURL()}
          objectFit="cover"
          style={styles.video}
        />
        <ButtonCotainer hang={hang} />
        <RTCView
          mirror
          streamURL={remoteStream.toURL()}
          objectFit="cover"
          style={styles.videoLocal}
        />
      </View>
    );
  }
  if (localStream){
    return (
      <View style={styles.container}>
        <RTCView
          mirror
          streamURL={localStream.toURL()}
          objectFit="cover"
          style={styles.video}
        />
        <ButtonCotainer hang={hang} />
      </View>
    )}
  
  return <ButtonCotainer hang={hang} />;
};

export default Video;

const styles = StyleSheet.create({
  bContainer: {
    flexDirection: 'row',
    bottom: 30,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoLocal: {
    position: 'absolute',
    width: 100,
    height: 150,
    top: 0,
    left: 20,
    elevation: 10,
    zIndex: 10,
  },
});
