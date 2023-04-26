import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import Video from './src/components/Video';
import Fire from './src/components/Fire';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import GettingCall from './src/components/GettingCall';
import firestore from '@react-native-firebase/firestore';
import { activateKeepAwake, deactivateKeepAwake} from "@sayem314/react-native-keep-awake";
activateKeepAwake()
const App = () => {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [gettingCall, setGettingCall] = useState(false);
  const pc = useRef();
  const connecting = useRef(false);
  let mediaConstraints = {
    audio: true,
    video: {
      frameRate: 30,
      facingMode: 'user',
    },
  };
  let peerConstraints = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  };
  let sessionConstraints = {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
      VoiceActivityDetection: true,
    },
  };
  useEffect(() => {
    const cRef = firestore().collection('meet').doc('chatId');
    const subscribe = cRef.onSnapshot(snapshot => {
      const data = snapshot.data();
      if (data) {
        if (
          pc.current &&
          !pc.current.remoteDescription &&
          data &&
          data.answer
        ) {
          pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        if (!connecting.current && data.offer && data) {
          setGettingCall(true);
        }
      }
    });
    const subscribeDelete = cRef.collection('callee').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type == 'removed') {
          hang();
        }
      });
    });
    return () => {
      subscribe();
      subscribeDelete();
    };
  }, []);

  const setupWebrtc = async () => {
    try {
      pc.current = new RTCPeerConnection(peerConstraints);

      const stream = await mediaDevices.getUserMedia(mediaConstraints);
      if (stream) {
        setLocalStream(stream);
        stream.getTracks().forEach(track => {
          pc.current.addTrack(track, stream);
        });
      }
      pc.current.addEventListener('track', event => {
        const rStream = new MediaStream();
        rStream.addTrack(event.track, rStream);
        setRemoteStream(rStream);
      
      });
    } catch (error) {
      console.log(error);
    }
  };
  const call = async () => {
    try {
      connecting.current = true;

      await setupWebrtc();

      const cRef = firestore().collection('meet').doc('chatId');
      
      const offer = await pc.current.createOffer(sessionConstraints);
      await pc.current.setLocalDescription(offer);
      
      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      };
      await collectIceCandidates(cRef, 'caller', 'callee');
      cRef.set(cWithOffer);
    } catch (error) {
      console.log(error);
    }
  };

  const collectIceCandidates = async (cRef, localName, remoteName) => {
    try {
      const candidateCollection = cRef.collection(localName);
      if (pc.current) {
        pc.current.addEventListener('icecandidate', event => {
          if (event.candidate) candidateCollection.add(event.candidate);
        });
      }
      cRef.collection(remoteName).onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type == 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.current?.addIceCandidate(candidate);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
  const join = async () => {
    connecting.current = true;
    setGettingCall(false);

    try {
      const cRef = firestore().collection('meet').doc('chatId');
      const offer = await (await cRef.get()).data().offer
      if (offer) {
        await setupWebrtc();

        pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.current.createAnswer();
        pc.current.setLocalDescription(answer);
        const cWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        await collectIceCandidates(cRef, 'callee', 'caller');
        await cRef.update(cWithAnswer);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hang = async () => {
    setGettingCall(false);
    connecting.current = false;
    await streamCleanUp();
    await firestoreCleanUp();
    if (pc.current) pc.current.close();
    setLocalStream(null);
    setRemoteStream(null);
  };

  const streamCleanUp = async () => {
    try {
      localStream.getTracks().forEach(track => track.stop());
      localStream.release();
    } catch (error) {
      console.log(error);
    }
  };
  const firestoreCleanUp = async () => {
    const cRef = firestore().collection('meet').doc('chatId');
    if (cRef) {
      try {
        const calleeCandidate = await cRef.collection('callee').get();
        calleeCandidate.forEach(async candidate => {
          await candidate.ref.delete();
        });
        const callerCandidate = await cRef.collection('caller').get();
        callerCandidate?.forEach(async candidate => {
          await candidate.ref.delete();
        });
        cRef.delete();
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  if (gettingCall) {
    return <GettingCall hang={hang} join={join} />;
  }
  if (localStream) {
    return (
      <Video localStream={localStream} remoteStream={remoteStream} hang={hang} />
    );
  }
  return (
    <View style={styles.container}>
      <Pressable style={styles.call} onPress={call}>
        <Text>CALL</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  call: {
    backgroundColor: 'grey',
    width: 80,
    height: 80,
    padding: 5,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
