// src/navigation/types.ts
export type RootStackParamList = {
    MainTabs: undefined;
    Chat: undefined;
  };
  interface Video {
  id: string | number; // Or a more specific ID type
  videoUrl: string;
  // Add other relevant properties like title, user, etc.
  title?: string;
  user?: string;
}
  