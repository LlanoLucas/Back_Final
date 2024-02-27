import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
export const PORT = process.env.PORT || 8080;
