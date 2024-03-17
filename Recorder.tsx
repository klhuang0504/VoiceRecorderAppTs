import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';

const Recorder: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status !== 'granted') {
      alert('Permission to record audio is required!');
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to record audio is required!');
        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped, URI:', uri);
        setRecording(null);
        setFileUri(uri); // Set the URI to upload after recording
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const downloadFile = async () => {
    if (fileUri) {
      const fileName = 'recorded_audio.mp3'; // Change the file name if needed
    //   await FileSystem.downloadAsync(fileUri, FileSystem.documentDirectory + fileName);
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
        <Text style={{ fontSize: 20 }}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      {fileUri && (
        <TouchableOpacity onPress={downloadFile} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 20, color: 'blue' }}>Download Record</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Recorder;
