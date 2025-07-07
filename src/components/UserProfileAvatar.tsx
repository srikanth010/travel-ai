import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  isFirstTimeUser: boolean;
  isLoggedIn: boolean;
  userName?: string;
  avatarUrl?: string;
  onSignInPress?: () => void;
};

const UserProfileAvatar: React.FC<Props> = ({
  isFirstTimeUser,
  isLoggedIn,
  userName,
  avatarUrl,
  onSignInPress,
}) => {
  const showAvatar = !isFirstTimeUser && isLoggedIn && !!userName;
  const greeting = isFirstTimeUser ? 'Welcome' : 'Welcome Back 👋';

  return (
    <View style={styles.container}>
      {showAvatar && (
        <Image
          source={{ uri: avatarUrl || 'https://i.pravatar.cc/150?img=12' }}
          style={styles.avatar}
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        {showAvatar && <Text style={styles.userName}>{userName}</Text>}

        {!isLoggedIn && (
          <TouchableOpacity onPress={onSignInPress}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default UserProfileAvatar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  signInText: {
    fontSize: 14,
    color: '#00BFFF',
    marginTop: 4,
  },
});
