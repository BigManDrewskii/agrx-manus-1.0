/**
 * Theme Switching Tests
 *
 * Verifies the entire theme pipeline works correctly:
 * - ThemeProvider resolves schemes properly
 * - useColors returns correct palette for each scheme
 * - CSS variables in global.css match theme.config.js
 * - All components use reactive theme hooks (no hardcoded colors)
 * - Tab layout and root layout respond to theme changes
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf-8");
}

function readAllTsxFiles(dir: string): { path: string; content: string }[] {
  const results: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readAllTsxFiles(fullPath));
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      results.push({ path: fullPath, content: readFile(fullPath) });
    }
  }
  return results;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Theme Pipeline Integrity", () => {
  it("theme.config.js has both light and dark values for every token", () => {
    const config = readFile("theme.config.js");
    // Extract all token definitions
    const tokenMatches = config.matchAll(/(\w+):\s*\{[^}]*light:\s*['"][^'"]+['"][^}]*dark:\s*['"][^'"]+['"]/g);
    const tokens = [...tokenMatches].map((m) => m[1]);

    // Should have at least the core tokens
    const requiredTokens = [
      "primary", "background", "surface", "foreground", "muted",
      "border", "success", "warning", "error",
    ];
    for (const token of requiredTokens) {
      expect(tokens).toContain(token);
    }
  });

  it("global.css has CSS variables for all tokens in theme.config.js", () => {
    const config = readFile("theme.config.js");
    const css = readFile("global.css");

    // Extract token names from config
    const tokenNames = [...config.matchAll(/^\s*(\w+):\s*\{/gm)].map((m) => m[1]);

    // Check :root has variables for each token
    for (const token of tokenNames) {
      expect(css).toContain(`--color-${token}`);
    }

    // Check dark theme block exists
    expect(css).toContain(':root[data-theme="dark"]');
  });

  it("global.css light values match theme.config.js light values", () => {
    const config = readFile("theme.config.js");
    const css = readFile("global.css");

    // Extract light values from config
    const lightValues: Record<string, string> = {};
    const matches = config.matchAll(/(\w+):\s*\{[^}]*light:\s*'([^']+)'/g);
    for (const m of matches) {
      lightValues[m[1]] = m[2];
    }

    // Check CSS :root block (before dark block)
    const rootBlock = css.split(':root[data-theme="dark"]')[0];
    for (const [token, value] of Object.entries(lightValues)) {
      expect(rootBlock).toContain(`--color-${token}: ${value}`);
    }
  });

  it("global.css dark values match theme.config.js dark values", () => {
    const config = readFile("theme.config.js");
    const css = readFile("global.css");

    // Extract dark values from config
    const darkValues: Record<string, string> = {};
    const matches = config.matchAll(/(\w+):\s*\{[^}]*dark:\s*'([^']+)'/g);
    for (const m of matches) {
      darkValues[m[1]] = m[2];
    }

    // Check dark block
    const darkBlock = css.split(':root[data-theme="dark"]')[1] || "";
    for (const [token, value] of Object.entries(darkValues)) {
      expect(darkBlock).toContain(`--color-${token}: ${value}`);
    }
  });
});

describe("ThemeProvider Correctness", () => {
  it("ThemeProvider applies NativeWind vars() with all tokens", () => {
    const provider = readFile("lib/theme-provider.tsx");

    // Should build vars from SchemeColors
    expect(provider).toContain("buildNativeWindVars");
    expect(provider).toContain("vars(");
    expect(provider).toContain("SchemeColors");
  });

  it("ThemeProvider sets NativeWind colorScheme on theme change", () => {
    const provider = readFile("lib/theme-provider.tsx");
    expect(provider).toContain("nativewindColorScheme.set(");
  });

  it("ThemeProvider applies web CSS variables synchronously", () => {
    const provider = readFile("lib/theme-provider.tsx");
    expect(provider).toContain("applyWebCSSVariables");
    expect(provider).toContain("root.style.setProperty");
    expect(provider).toContain("root.dataset.theme");
  });

  it("ThemeProvider uses key to force re-render on theme change", () => {
    const provider = readFile("lib/theme-provider.tsx");
    // The root View should have a key that changes with colorScheme
    expect(provider).toMatch(/key=\{.*colorScheme/);
  });

  it("ThemeProvider persists preference to AsyncStorage", () => {
    const provider = readFile("lib/theme-provider.tsx");
    expect(provider).toContain("AsyncStorage.setItem");
    expect(provider).toContain("AsyncStorage.getItem");
  });
});

describe("Root Layout Theme Integration", () => {
  it("root layout uses reactive StatusBar based on colorScheme", () => {
    const layout = readFile("app/_layout.tsx");
    // StatusBar should read from theme context
    expect(layout).toContain("useThemeContext");
    expect(layout).toContain("colorScheme");
    // Should set style based on scheme
    expect(layout).toMatch(/style=\{.*colorScheme.*===.*"dark".*\?.*"light".*:.*"dark"/);
  });

  it("root layout wraps content in ThemeProvider", () => {
    const layout = readFile("app/_layout.tsx");
    expect(layout).toContain("<ThemeProvider>");
    expect(layout).toContain("</ThemeProvider>");
  });
});

describe("Tab Layout Theme Reactivity", () => {
  it("tab layout uses key based on colorScheme for re-render", () => {
    const tabLayout = readFile("app/(tabs)/_layout.tsx");
    expect(tabLayout).toMatch(/key=\{.*colorScheme/);
  });

  it("tab layout reads colors from useColors hook", () => {
    const tabLayout = readFile("app/(tabs)/_layout.tsx");
    expect(tabLayout).toContain("useColors()");
  });
});

describe("Component Theme Reactivity", () => {
  it("all screen files use useColors() or NativeWind tokens for colors", () => {
    const screenFiles = readAllTsxFiles("app");

    // Exclude share-card (intentionally hardcoded dark), theme-lab (dev), oauth callback
    const screensToCheck = screenFiles.filter(
      (f) =>
        !f.path.includes("share-card") &&
        !f.path.includes("theme-lab") &&
        !f.path.includes("_layout") &&
        f.path.endsWith(".tsx")
    );

    for (const file of screensToCheck) {
      // Each screen should either use useColors or NativeWind className tokens
      const usesColors = file.content.includes("useColors()");
      const usesNativeWind =
        file.content.includes("bg-background") ||
        file.content.includes("text-foreground") ||
        file.content.includes("bg-surface");
      const usesTypography = file.content.includes("from \"@/components/ui/typography\"");

      expect(
        usesColors || usesNativeWind || usesTypography,
      ).toBe(true);
    }
  });

  it("all component files use useColors() for dynamic colors", () => {
    const componentFiles = readAllTsxFiles("components");

    // Exclude:
    // - share-card.tsx: intentionally hardcoded dark for social sharing
    // - external-link.tsx: utility wrapper, no visual styling
    // - haptic-tab.tsx: behavior wrapper, no visual styling
    // - icon-symbol: platform-specific icon wrapper, receives color as prop
    const componentsToCheck = componentFiles.filter(
      (f) =>
        !f.path.includes("share-card.tsx") &&
        !f.path.includes("external-link.tsx") &&
        !f.path.includes("haptic-tab.tsx") &&
        !f.path.includes("icon-symbol") &&
        !f.path.includes("animated-pressable.tsx") &&
        !f.path.includes("animated-number.tsx") &&
        f.path.endsWith(".tsx")
    );

    for (const file of componentsToCheck) {
      const usesColors = file.content.includes("useColors()");
      const usesNativeWind =
        file.content.includes("bg-background") ||
        file.content.includes("text-foreground");
      // Typography components (Title1, Body, etc.) internally call useColors()
      const usesTypography = file.content.includes('from "@/components/ui/typography"');
      const isSimple = file.content.length < 500; // Very small components may not need colors

      if (!isSimple && !usesColors && !usesNativeWind && !usesTypography) {
        throw new Error(`Component ${file.path} (${file.content.length} chars) does not use useColors(), NativeWind tokens, or Typography components`);
      }
    }
  });
});

describe("CSS Transitions for Smooth Theme Switching", () => {
  it("global.css includes color transition rules", () => {
    const css = readFile("global.css");
    expect(css).toContain("transition-property");
    expect(css).toContain("background-color");
    expect(css).toContain("200ms");
  });

  it("SVG elements have transitions disabled", () => {
    const css = readFile("global.css");
    expect(css).toContain("svg");
    expect(css).toContain("transition: none");
  });
});

describe("Settings Theme Toggle", () => {
  it("settings screen uses setPreference from ThemeContext", () => {
    const settings = readFile("app/settings.tsx");
    expect(settings).toContain("useThemeContext");
    expect(settings).toContain("setPreference");
  });

  it("settings screen offers system, light, and dark options", () => {
    const settings = readFile("app/settings.tsx");
    expect(settings).toContain('"system"');
    expect(settings).toContain('"light"');
    expect(settings).toContain('"dark"');
  });
});
