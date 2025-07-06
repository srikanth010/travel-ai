// screens/VideoFeedScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoItem from '../components/VideoItem';
import { launchImageLibrary } from 'react-native-image-picker';

const { height } = Dimensions.get('window');

const initialVideos = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
];

const VideoFeedScreen: React.FC = () => {
  const [videoSources, setVideoSources] = useState<string[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const handleUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        videoQuality: 'high',
      },
      (response) => {
        if (response.didCancel || response.errorCode || !response.assets || response.assets.length === 0) {
          return;
        }
  
        const asset = response.assets[0];
        const uri = asset.uri;
  
        if (uri) {
          setVideoSources((prev) => [uri, ...prev]);
        }
      }
    );
  };
  

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Icon name="cloud-upload-outline" size={28} color="white" />
      </TouchableOpacity>

      {/* Video Feed */}
      <FlatList
        data={videoSources}
        renderItem={({ item, index }) => (
          <VideoItem source={item} isFocused={index === currentIndex} />
        )}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
        }}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  uploadButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 30,
  },
});

export default VideoFeedScreen;
