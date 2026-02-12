

function TemplateQuestionaire({name,icon="📋",id=1,OnDelete}){

    return(

        
        <div className="questionnaire-card">
          <div
            className="delete-x"
            onClick={() => OnDelete({id})}
          >
            ×
          </div>
          <div className="questionnaire-icon">{icon}</div>
          <h3>{name}</h3>
        </div>
    );
}
export default TemplateQuestionaire;