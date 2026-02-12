import { useState } from "react";

function FormBuilder({ form, current, onAdd, showToast }) {
  const CurrentCriteria = form.find((f) => f.criteriaID === current);

  const [QuestionTitle, setQuestionTitle] = useState("");
  const [Options, setOptions] = useState([
    { label: "", points: 1 },
    { label: "", points: 2 },
    { label: "", points: 3 },
  ]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...Options];
    newOptions[index].label = value;
    newOptions[index].points = index < 4 ? index + 1 : 5;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...Options, { label: "", points: Options.length + 1 }]);
  };

  const handleRemoveOption = (index) => {
    if (Options.length > 1) {
      const filteredOptions = Options.filter((_, i) => i !== index);
      // Recalculate points for remaining options to maintain sequential order
      const renumberedOptions = filteredOptions.map((option, newIndex) => ({
        ...option,
        points: newIndex < 4 ? newIndex + 1 : 5,
      }));
      setOptions(renumberedOptions);
    }
  };

  const handleDeleteQuestion = () => {
    setQuestionTitle("");
    setOptions([
      { label: "", points: 1 },
      { label: "", points: 2 },
      { label: "", points: 3 },
    ]);
  };

  const handleAddToList = () => {
    // Check if no criteria exist at all
    if (!form || form.length === 0) {
      if (showToast) {
        showToast(
          "Please add at least one criteria before adding a question",
          "error"
        );
      } else {
        alert("Please add at least one criteria before adding a question.");
      }
      return;
    }

    // Check if criteria exist but none is selected
    if (!current || !CurrentCriteria) {
      if (showToast) {
        showToast("Please select a criteria before adding a question", "error");
      } else {
        alert("Please select a criteria before adding a question.");
      }
      return;
    }

    // Check if question title is empty
    if (!QuestionTitle.trim()) {
      if (showToast) {
        showToast("Please enter a question title", "error");
      }
      return;
    }

    // Filter out options with empty labels
    const filledOptions = Options.filter((opt) => opt.label.trim() !== "");

    // Check if there are enough options
    if (filledOptions.length < 2) {
      if (showToast) {
        showToast("Please provide at least 2 options with text", "error");
      }
      return;
    }

    const question = {
      questionID: CurrentCriteria.questionList.length,
      criteriaID: current,
      title: QuestionTitle.trim(),
      optionList: filledOptions,
    };

    onAdd(question);

    if (showToast) {
      showToast(
        `Question "${QuestionTitle.trim()}" added successfully!`,
        "success"
      );
    }

    handleDeleteQuestion(); // Reset inputs after adding
  };

  return (
    <div className="form-section">
      <label htmlFor="Qform">Questions</label>
      <input
        id="Qform"
        type="text"
        placeholder="add your question here..."
        value={QuestionTitle}
        onChange={(e) => setQuestionTitle(e.target.value)}
        className="question-input"
      />

      <h3>Options</h3>
      <div className="options-section">
        {Options.map((option, index) => (
          <div key={index} className="option-row">
            <input
              type="text"
              value={option.label}
              placeholder={`option ${index + 1}`}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="option-input"
            />
            <span className="points">({option.points} points)</span>
            <button
              className="remove-option"
              onClick={() => handleRemoveOption(index)}
            >
              ×
            </button>
          </div>
        ))}

        {Options.length < 5 && (
          <button className="add-option" onClick={handleAddOption}>
            +
          </button>
        )}
      </div>
      <div className="action-buttons">
        <button className="delete-question" onClick={handleDeleteQuestion}>
          Delete the question
        </button>
        <button className="add-to-list" onClick={handleAddToList}>
          Add to the list
        </button>
      </div>
    </div>
  );
}

export default FormBuilder;
