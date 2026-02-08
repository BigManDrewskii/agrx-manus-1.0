/**
 * Font loading hook for AGRX.
 *
 * Loads Inter (Regular, Medium, SemiBold, Bold) and
 * JetBrains Mono (Regular, Medium, Bold) via expo-font.
 *
 * Usage in root layout:
 *   const [fontsLoaded, fontError] = useAppFonts();
 *   if (!fontsLoaded && !fontError) return null; // hold splash
 */
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";

export function useAppFonts() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
}
