import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Deshabilitar reglas globalmente
      "react-hooks/exhaustive-deps": "off", // Ignorar dependencias en useEffect
      "@typescript-eslint/no-explicit-any": "off", // Permitir el uso de 'any'
      "@typescript-eslint/no-unused-vars": "off", // Ignorar variables no utilizadas
      "no-console": "off", // Permitir console.log (si es necesario)
    },
  },
];

export default eslintConfig;
