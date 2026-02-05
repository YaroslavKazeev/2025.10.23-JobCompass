import "./Pagination.css";
import { useState } from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const safeTotal = Number.isFinite(totalPages)
    ? Math.max(0, Math.floor(totalPages))
    : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage);

  // Track the previous prop to detect changes during render
  const [prevPage, setPrevPage] = useState(currentPage);

  /**
   * FIX: Synchronizing state during render.
   * This replaces useEffect and avoids "cascading renders."
   * React allows calling a setter during render if it's wrapped in a condition.
   */
  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    if (!isEditing) {
      setInputValue(currentPage);
    }
  }
  if (safeTotal === 0) return null;

  function submitPage() {
    const page = parseInt(inputValue, 10);
    const isValidPage = !isNaN(page);

    if (isValidPage) {
      // Clamp the value between 1 and safeTotal
      const validatedPage = Math.min(Math.max(page, 1), safeTotal);
      onPageChange(validatedPage);
    } else {
      setInputValue(currentPage);
    }
    setIsEditing(false);
  }

  return (
    <div
      className="pagination"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => {
          onPageChange(Math.max(currentPage - 1, 1));
          window.scrollTo(0, 0);
        }}
        disabled={currentPage === 1}
        className="pagination-btn"
        aria-label="Go to previous page"
      >
        Prev
      </button>

      <div className="page-numbers">
        {isEditing ? (
          <input
            aria-label="Page number input"
            className="page-number-input"
            type="number"
            min="1"
            max={safeTotal}
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitPage();
              }
              if (e.key === "Escape") {
                setInputValue(currentPage);
                setIsEditing(false);
              }
            }}
            onBlur={() => {
              if (isEditing) submitPage();
            }}
          />
        ) : (
          <button
            className="page-display-trigger"
            onClick={() => setIsEditing(true)}
            title="Click to edit page number"
          >
            {currentPage}
          </button>
        )}
      </div>

      <button
        onClick={() => {
          onPageChange(Math.min(currentPage + 1, safeTotal));
          window.scrollTo(0, 0);
        }}
        disabled={currentPage === safeTotal}
        className="pagination-btn"
        aria-label="Go to next page"
      >
        Next
      </button>

      <span className="page-total">out of {safeTotal}</span>
    </div>
  );
}
