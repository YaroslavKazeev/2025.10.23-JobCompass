export default function normalizeEmploymentType(typeList) {
  let result = null;
  if (Array.isArray(typeList) && typeList.length > 0) {
    const type = typeList[0];
    if (typeof type === "string" && type.length > 0) {
      result = (
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      ).replaceAll("_", "-");
      if (result === "Intern" || result === "Internship") {
        result = "Internship";
      } else if (result === "Contract" || result === "Contractor") {
        result = "Temporary";
      }
    }
  }
  return result;
}
