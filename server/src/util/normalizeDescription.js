export default function normalizeDescription(str) {
  const s = typeof str === "string" ? str : "";
  return " " + s.replace(/[^A-Za-z0-9+#]/g, " ").replace(/ +/g, " ") + " ";
}
