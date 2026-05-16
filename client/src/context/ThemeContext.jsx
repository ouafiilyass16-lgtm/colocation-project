// client/src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Initialisation du thème avec vérification du localStorage et des préférences système
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("locastudy-theme");
    if (savedTheme) return savedTheme;
    
    // Si aucun choix utilisateur, on suit le système d'exploitation
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Met à jour l'attribut HTML et sauvegarde le choix à chaque changement de thème
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("locastudy-theme", theme);
  }, [theme]);

  // Écouteur dynamique des changements de thème du système d'exploitation
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e) => {
      // On ne change automatiquement que si l'utilisateur n'a pas défini de préférence manuelle
      if (!localStorage.getItem("locastudy-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Fonction basique d'alternance entre les modes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour consommer le thème de manière sécurisée
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être obligatoirement utilisé à l'intérieur d'un <ThemeProvider>");
  }
  return context;
}