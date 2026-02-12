import { useState } from "react";

function CategorySideBar({
  list,
  current,
  onSelect,
  onAdd,
  onDelete,
  showToast,
}) {
  const renderCategories = () =>
    list.map((item) => {
      return (
        <div
          key={item.criteriaID}
          className={`category ${current === item.criteriaID ? "active" : ""}`}
        >
          <span
            className="category-title"
            onClick={() => onSelect(item.criteriaID)}
          >
            {item.title}
          </span>
          <button
            className="delete-criteria-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.criteriaID);
            }}
            title="Delete criteria"
          >
            ×
          </button>
        </div>
      );
    });

  const handleAddClick = () => {
    const name = prompt("Enter category name:");
    if (name) {
      onAdd(name);
    }
  };

  return (
    <div className="categories">
      {renderCategories()}
      <div className="add-category" onClick={handleAddClick}>
        {" "}
        +{" "}
      </div>
    </div>
  );
}

export default CategorySideBar;
