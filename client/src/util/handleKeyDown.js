export default function handleKeyDown(e, onClick) {
  if (e.key === "Enter") {
    e.preventDefault();
    onClick();
  }
}
