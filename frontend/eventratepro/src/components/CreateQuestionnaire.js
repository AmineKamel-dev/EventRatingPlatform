import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import "./CreateQuestionnaire.css";
import CategorySideBar from "./sub-component/CategorySideBar";
import Preview from "./sub-component/Preview";
import FormBuilder from "./sub-component/FormBuilder";

function CreateQuestionnaire() {
  const { User } = useAuthContext();
  const [Questionnaire, setQuestionnaire] = useState(null);
  const [criteriaList, setCriteriaList] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [eventName, setEventName] = useState("");

  const location = useLocation();
  const template = location.state?.template;
  const navigate = useNavigate();
  const questionnaireID = useRef(crypto.randomUUID());
  console.log("Global questionnaireID: ", questionnaireID.current);
  const eventID = useRef(crypto.randomUUID());

  // Toast notification function
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    if (template) {
      console.log("Received Template:", template);
      const mappedCriteriaList = template.criteriaList.map(
        (criteria, index) => ({
          ...criteria,
          questionnaireID: questionnaireID.current,
          criteriaID: index + 1,
          questionList: criteria.questionList.map((q, i) => ({
            ...q,
          })),
        })
      );
      console.log("questionnaireID in useEffect:", questionnaireID);
      console.log(
        "questionnaireID.current in useEffect:",
        questionnaireID.current
      );
      setCriteriaList(mappedCriteriaList);
    }
  }, [template]);

  const [selectedCategory, setSelectedCategory] = useState(1);
  //Tag: Function related to building the questionaire
  //allows creatinga new criteria
  const addCriteria = (name) => {
    if (!name || !name.trim()) {
      showToast("Please enter a criteria name", "error");
      return;
    }

    // Check if criteria name already exists
    const existingCriteria = criteriaList.find(
      (c) => c.title.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingCriteria) {
      showToast("A criteria with this name already exists", "error");
      return;
    }

    const newCriteria = {
      criteriaID: criteriaList.length + 1,
      questionnaireID: questionnaireID.current,
      title: name.trim(),
      questionList: [],
    };
    setCriteriaList((prev) => [...prev, newCriteria]);
    showToast(`Criteria "${name.trim()}" added successfully!`, "success");
  };
  // This functions navigate  copies previous list inside updated
  //copies the needed criteria
  // adds the question to the questionlist of the copy
  // uses the modified criteria copy to update criterialist
  //why use copy and not change the actual object ?
  //react checks if the reference to the object has changed to
  // know if it should re-render.
  // so by making a copy to replace the original, we enforce rerendering
  // using .map helps  avoiding this process (next function)
  const addQuestionToCriteria = (question, criteriaID = selectedCategory) => {
    setCriteriaList((prev) => {
      const index = prev.findIndex((c) => c.criteriaID === criteriaID);
      if (index === -1) return prev;

      const updated = [...prev];
      updated[index] = { ...updated[index] };
      updated[index].questionList = [...updated[index].questionList, question];
      return updated;
    });
  };

  // Delete a criteria and all its questions
  const deleteCriteria = (criteriaID) => {
    const criteria = criteriaList.find((c) => c.criteriaID === criteriaID);
    if (!criteria) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the criteria "${criteria.title}" and all its questions?`
    );
    if (!confirmed) return;

    setCriteriaList((prev) => {
      const filtered = prev.filter((c) => c.criteriaID !== criteriaID);
      // Renumber criteria IDs to maintain sequence
      return filtered.map((criteria, index) => ({
        ...criteria,
        criteriaID: index + 1,
      }));
    });

    // If we deleted the currently selected criteria, switch to the first one
    if (selectedCategory === criteriaID) {
      const remainingCriteria = criteriaList.filter(
        (c) => c.criteriaID !== criteriaID
      );
      if (remainingCriteria.length > 0) {
        setSelectedCategory(1); // Will be the first criteria after renumbering
      }
    } else if (selectedCategory > criteriaID) {
      // Adjust selected category if it's after the deleted one
      setSelectedCategory(selectedCategory - 1);
    }

    showToast(`Criteria "${criteria.title}" deleted successfully!`, "success");
  };

  // Delete a specific question from a criteria
  const deleteQuestion = (criteriaID, questionID) => {
    setCriteriaList((prev) => {
      return prev.map((criteria) => {
        if (criteria.criteriaID === criteriaID) {
          const question = criteria.questionList.find(
            (q) => q.questionID === questionID
          );
          const questionTitle = question ? question.title : "Question";

          const updatedQuestionList = criteria.questionList
            .filter((q) => q.questionID !== questionID)
            // Renumber question IDs to maintain sequence
            .map((q, index) => ({ ...q, questionID: index }));

          // Show success message
          setTimeout(() => {
            showToast(
              `Question "${questionTitle}" deleted successfully!`,
              "success"
            );
          }, 100);

          return {
            ...criteria,
            questionList: updatedQuestionList,
          };
        }
        return criteria;
      });
    });
  };

  const handleBackClick = () => {
    navigate("/questionnaire");
  };

  //changes which category(criteria) is selected
  // triggers change in preview
  const handleCategoryClick = (categoryID) => {
    setSelectedCategory(categoryID);
  };

  const handleSaveQuestionnaire = () => {
    // Validation checks
    if (criteriaList.length === 0) {
      showToast("Please add at least one criteria before saving", "error");
      return;
    }

    const totalQuestions = criteriaList.reduce(
      (sum, criteria) => sum + criteria.questionList.length,
      0
    );

    if (totalQuestions === 0) {
      showToast(
        "Please add at least one question before saving the questionnaire",
        "error"
      );
      return;
    }

    // Show template naming modal
    setShowTemplateModal(true);
  };

  const handleTemplateSubmit = () => {
    if (!templateName.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }

    console.log("saving questionaire");

    //assigns the current Criteria list to questionaire
    // marks questionaire as template
    const questionnaireObj = {
      questionnaireID: questionnaireID.current,
      eventID: null,
      criteriaList: criteriaList,
      isTemplate: true,
    };
    setQuestionnaire(questionnaireObj);

    const daten = {
      userID: User.uid,
      Questionnaire: questionnaireObj,
      templateTitle: templateName.trim(),
    };

    console.log(daten);

    // built-in browser API that allows HTTP requests (GET, POST)
    // fetch = fetch data (GET) + send data (POST)
    fetch("https://eventrate-pro.de/template/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(daten),
    })
      // wait for the response from backend and parse the response as JSON
      .then((res) => res.json())
      // once JSON is parsed, handle the response from the backend and go back to the questionnaire-overview
      .then((response) => {
        console.log("Answer from Backend:", response);
        if (response.status === "success") {
          console.log("saved questionaire");
          showToast("Questionnaire saved successfully!", "success");
          setShowTemplateModal(false);
          setTemplateName("");
          setTimeout(() => {
            navigate("/questionnaire");
          }, 1000);
        } else {
          showToast(
            response.message || "Failed to save questionnaire",
            "error"
          );
        }
      })
      // if something goes wrong, the error is handled here
      .catch((error) => {
        console.error("Error when sending:", error);
        showToast("Failed to save questionnaire. Please try again.", "error");
      });
  };

  const handleTemplateModalClose = () => {
    setTemplateName("");
    setShowTemplateModal(false);
  };

  // if pressed "Setup event"
  const handleSetupEvent = () => {
    // Validation checks
    if (criteriaList.length === 0) {
      showToast(
        "Please add at least one criteria before setting up the event",
        "error"
      );
      return;
    }

    const totalQuestions = criteriaList.reduce(
      (sum, criteria) => sum + criteria.questionList.length,
      0
    );

    // if there is no questions, the user cannot proceed
    if (totalQuestions === 0) {
      showToast(
        "Please add at least one question before setting up the event",
        "error"
      );
      return;
    }

    // Show event naming modal
    setShowEventModal(true);
  };

  const handleEventSubmit = () => {
    if (!eventName.trim()) {
      showToast("Please enter an event name", "error");
      return;
    }

    const questionnaireObj = {
      questionnaireID: questionnaireID.current,
      eventID: eventID.current,
      criteriaList: criteriaList,
      isTemplate: false,
    };
    setQuestionnaire(questionnaireObj);

    const daten = {
      userID: User.uid,
      Questionnaire: questionnaireObj,
      eventTitle: eventName.trim(),
    };

    navigate("/event-details", { state: daten });
  };

  const handleEventModalClose = () => {
    setEventName("");
    setShowEventModal(false);
  };

  return (
    <div className="create-questionnaire-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : "⚠"}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Template Naming Modal */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Save Template</h2>
            <p>Enter a name for your template:</p>
            <input
              type="text"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleTemplateSubmit}>Save Template</button>
              <button onClick={handleTemplateModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Naming Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Setup Event</h2>
            <p>Enter a name for your event:</p>
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleEventSubmit}>Setup Event</button>
              <button onClick={handleEventModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="back-arrow" onClick={handleBackClick}>
        ←
      </div>
      <div className="main-content">
        <div className="left-section">
          <h2>Preview of Questionnaire</h2>
          <div className="categories-and-preview">
            <div className="categories">
              <CategorySideBar
                list={criteriaList}
                current={selectedCategory}
                onSelect={handleCategoryClick}
                onAdd={addCriteria}
                onDelete={deleteCriteria}
                showToast={showToast}
              />
            </div>
            <div className="preview-section">
              <Preview
                currentID={selectedCategory}
                list={criteriaList}
                onDeleteQuestion={deleteQuestion}
              />
            </div>
          </div>
        </div>
        <div className="right-section">
          <FormBuilder
            form={criteriaList}
            current={selectedCategory}
            onAdd={addQuestionToCriteria}
            showToast={showToast}
          />
          <div className="save-section">
            <button
              className="save-questionnaire"
              onClick={handleSaveQuestionnaire}
            >
              Save questionnaire
            </button>
            <button className="save-questionnaire" onClick={handleSetupEvent}>
              Setup event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateQuestionnaire;
