import { lightColors, darkColors } from './theme/colors';

export const lightTheme = {
  colors: lightColors,
};

export const darkTheme = {
  colors: darkColors,
};

export type ThemeType = typeof lightTheme;
