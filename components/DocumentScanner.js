import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button,
  Image,
  Platform,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Permissions from 'react-native-permissions';
import PDFScanner from '@woonivers/react-native-document-scanner';
import {Icon} from 'react-native-elements';
import ImageEditor from './ImageEditor';
import ImageCropper from './ImageCropper';

function DocumentScanner({navigation}) {
  const scanner = useRef(null);
  const [data, setData] = useState({});
  const [allowed, setAllowed] = useState(false);
  const [lastDetectionType, setLastDetectionType] = useState('');
  const [stableCounter, setStableCounter] = useState('');

  useEffect(() => {
    async function requestCamera() {
      const result = await Permissions.request(
        Platform.OS === 'android'
          ? 'android.permission.CAMERA'
          : 'ios.permission.CAMERA',
      );
      if (result === 'granted') {
        setAllowed(true);
      }
    }
    requestCamera();
  }, []);

  function handleOnPressRetry() {
    setData({});
  }

  function handleOnPress() {
    scanner.current.capture();
  }
  if (!allowed) {
    console.log('You must accept camera permission');
    return (
      <View style={styles.permissions}>
        <Text>You must accept camera permission</Text>
      </View>
    );
  }
  if (data.initialImage) {
    console.log('data', data);
    navigation.navigate('Image Cropper', {
      imageParam: data.initialImage,
      rectangleCoordinates: data.rectangleCoordinates,
    });
  }

  function renderDetectionType() {
    switch (lastDetectionType) {
      case 0:
        return 'Correctly formatted receipt found';
      case 1:
        return 'Bad angle found';
      case 2:
        return 'Rectangle too far';
      default:
        return 'No receipt detected yet';
    }
  }

  return (
    <>
      <Text>Receipt Scanner</Text>
      <PDFScanner
        useBase64={false}
        ref={scanner}
        style={styles.scanner}
        onPictureTaken={setData}
        overlayColor="rgba(255, 130, 0, 0.7)"
        enableTorch={false}
        quality={0.5}
        manualOnly={true}
        onRectangleDetect={({stableCounter, lastDetectionType}) => {
          setStableCounter(stableCounter),
            setLastDetectionType(lastDetectionType);
        }}
        detectionCountBeforeCapture={5000000}
        detectionRefreshRateInMs={5000}
      />
      <View style={styles.cameraButton}>
        <Icon
          reverse
          name="ios-camera"
          type="ionicon"
          color="#00BED2"
          onPress={handleOnPress}
        />
      </View>
      <Text style={styles.instructions}>
        🧾 Align your receipt with the overlay and tap the camera button.
      </Text>
      <Text style={styles.instructions}>{renderDetectionType()}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  scanner: {
    flex: 1,
    aspectRatio: undefined,
  },
  button: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  permissions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DocumentScanner;
