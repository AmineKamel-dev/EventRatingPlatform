function Preview({ currentID, list, onDeleteQuestion }) {
  console.log("Preview - currentID:", currentID);
  console.log("Preview - list:", list);

  if (!Array.isArray(list) || list.length === 0) {
    return <div>No criteria available yet</div>;
  }

  const CurrentCriteria = list.find((c) => c.criteriaID === Number(currentID));

  if (!CurrentCriteria) {
    return <div>No criteria selected</div>;
  }

  const questions = CurrentCriteria.questionList;

  return (
    <>
      <div className="preview-header">
        <div className="logo">📋🔍</div>
        <span>EventRate Pro</span>
      </div>
      <div className="preview-category">{CurrentCriteria.title}</div>
      <div className="questions-preview">
        {questions.length === 0 ? (
          <div className="no-questions">No questions added yet</div>
        ) : (
          questions.map((question, index) => (
            <div key={question.questionID} className="question-preview">
              <div className="question-header">
                <h4>
                  Q{index + 1}: {question.title}
                </h4>
                {onDeleteQuestion && (
                  <button
                    className="delete-question-btn"
                    onClick={() =>
                      onDeleteQuestion(
                        CurrentCriteria.criteriaID,
                        question.questionID
                      )
                    }
                    title="Delete question"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="options-preview">
                {question.optionList.map((option, optIndex) => (
                  <div key={optIndex} className="option-preview">
                    <input type="radio" name={`q${question.questionID}`} />
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Preview;
