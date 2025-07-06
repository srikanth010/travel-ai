// components/VideoItem.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';
import { useIsFocused } from '@react-navigation/native';

const { height } = Dimensions.get('window');

interface Props {
  source: string;
  isFocused: boolean;
}

const VideoItem: React.FC<Props> = ({ source, isFocused }) => {
  const playerRef = useRef<Video>(null);
  const [isPaused, setIsPaused] = useState(!isFocused);
  const screenIsFocused = useIsFocused(); // ✅ detects if screen is visible

  useEffect(() => {
    if (!screenIsFocused) {
      setIsPaused(true); // Pause video when user leaves screen
    } else {
      setIsPaused(!isFocused); // Pause if not in view
    }
  }, [screenIsFocused, isFocused]);

  const togglePlayPause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <TouchableWithoutFeedback onPress={togglePlayPause}>
      <View style={styles.container}>
        <Video
          ref={playerRef}
          source={{ uri: source }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={isPaused}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    height,
    width: '100%',
    backgroundColor: 'black',
  },
  video: {
    height: '100%',
    width: '100%',
  },
});

export default VideoItem;
