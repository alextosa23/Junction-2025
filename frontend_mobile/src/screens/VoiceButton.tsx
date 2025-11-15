// src/screens/VoiceButton.tsx
import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
} from "react-native";

type VoiceButtonProps = {
  onPress?: () => void;
};

const VoiceButton: React.FC<VoiceButtonProps> = ({ onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [scale]);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Text style={styles.icon}>🎤</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  icon: {
    fontSize: 32,
    color: "#FFFFFF",
  },
});

export default VoiceButton;
