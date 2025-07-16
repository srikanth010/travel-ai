// src/constants/theme.ts

interface Colors {
    primary: string;
    accent: string;
    background: string;
    text: string;
    textMuted: string;
    userBubble: string;
    aiBubble: string;
    buttonBackground: string;
    buttonText: string;
    borderColor: string;
    // Add more colors as needed
  }
  
  interface Spacing {
    xs: number; // Extra Small
    sm: number; // Small
    md: number; // Medium
    lg: number; // Large
    xl: number; // Extra Large
    // Add more spacing values as needed
  }
  
  interface BorderRadius {
    sm: number; // Small
    md: number; // Medium
    lg: number; // Large
    xl: number; // Extra Large
    circle: number; // For perfect circles
  }
  
  interface FontSize {
    xs: number; // Extra Small
    sm: number; // Small
    md: number; // Medium
    lg: number; // Large
    xl: number; // Extra Large
    h1: number;
    h2: number;
    h3: number;
    // Add more font sizes as needed
  }
  
  export const Colors: Colors = {
    primary: '#00BFFF', // Deep Sky Blue (your current send button/focused circle color)
    accent: '#007bff', // Another blue shade if needed
    background: '#121212', // Dark background
    text: '#FFFFFF', // White text
    textMuted: '#aaa', // Placeholder text color
    userBubble: 'rgba(255, 255, 255, 0.2)', // User message background
    aiBubble: 'rgba(32, 162, 243, 0.2)', // AI message background
    buttonBackground: '#00bfff', // Send button
    buttonText: '#fff',
    borderColor: 'rgba(255,255,255,0.1)', // Input border/background
  };
  
  export const Spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 20,
  };
  
  export const BorderRadius: BorderRadius = {
    sm: 4,
    md: 8,
    lg: 10,
    xl: 20,
    circle: 999, // A large number to ensure a circle for fixed height/width elements
  };
  
  export const FontSize: FontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    h1: 32,
    h2: 28,
    h3: 24,
  };
  
  // You can also define shadow styles here if you have reusable shadows
  export const Shadows = {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10, // For Android
    },
  };