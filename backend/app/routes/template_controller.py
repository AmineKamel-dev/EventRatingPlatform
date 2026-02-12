from flask import Blueprint, jsonify, request, json
from app.firebase import db
import uuid

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
template_bp = Blueprint('template_bp', __name__,url_prefix='/template')


# --- APIs --- #

# API: /template/createSampleTemplates
# This API creates 3 sample templates for new users
@template_bp.route('/createSampleTemplates', methods=['POST'])
def create_sample_templates():
    data = request.get_json()
    user_id = data.get('userID')
    
    if not user_id:
        return jsonify({"error": "Missing userID"}), 400
    
    try:
        # Sample Template 1: Study/Research Poster Evaluation
        template1 = {
            "questionnaireID": str(uuid.uuid4()),
            "userID": user_id,
            "title": "Study/Research Poster Evaluation",
            "eventID": None,
            "criteriaList": [
                {
                    "criteriaID": 1,
                    "title": "Content Quality",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How clear and well-organized is the research content?",
                            "optionList": [
                                {"label": "Excellent - Very clear and logical", "points": 5},
                                {"label": "Good - Mostly clear", "points": 4},
                                {"label": "Fair - Somewhat confusing", "points": 3},
                                {"label": "Poor - Hard to follow", "points": 2},
                                {"label": "Very Poor - Confusing", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How relevant and significant are the research findings?",
                            "optionList": [
                                {"label": "Highly significant findings", "points": 5},
                                {"label": "Moderately significant", "points": 4},
                                {"label": "Some significance", "points": 3},
                                {"label": "Limited significance", "points": 2},
                                {"label": "Not significant", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 2,
                    "title": "Visual Design",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How effective is the visual layout and design?",
                            "optionList": [
                                {"label": "Excellent - Very professional", "points": 5},
                                {"label": "Good - Well designed", "points": 4},
                                {"label": "Average - Acceptable", "points": 3},
                                {"label": "Below average - Needs improvement", "points": 2},
                                {"label": "Poor - Unprofessional", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "Are charts, graphs, and images appropriate and helpful?",
                            "optionList": [
                                {"label": "Very helpful and appropriate", "points": 5},
                                {"label": "Mostly helpful", "points": 4},
                                {"label": "Somewhat helpful", "points": 3},
                                {"label": "Not very helpful", "points": 2},
                                {"label": "Unhelpful or inappropriate", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 3,
                    "title": "Methodology",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How appropriate and rigorous is the research methodology?",
                            "optionList": [
                                {"label": "Highly rigorous and appropriate", "points": 5},
                                {"label": "Good methodology", "points": 4},
                                {"label": "Adequate methodology", "points": 3},
                                {"label": "Some methodological issues", "points": 2},
                                {"label": "Poor methodology", "points": 1}
                            ]
                        }
                    ]
                }
            ],
            "isTemplate": True
        }
        
        # Sample Template 2: Fair/Exhibition Evaluation
        template2 = {
            "questionnaireID": str(uuid.uuid4()),
            "userID": user_id,
            "title": "Fair/Exhibition Evaluation",
            "eventID": None,
            "criteriaList": [
                {
                    "criteriaID": 1,
                    "title": "Product Innovation",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How innovative and unique is the product/service?",
                            "optionList": [
                                {"label": "Highly innovative - Breakthrough", "points": 5},
                                {"label": "Very innovative", "points": 4},
                                {"label": "Moderately innovative", "points": 3},
                                {"label": "Somewhat innovative", "points": 2},
                                {"label": "Not innovative", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How practical and useful is the solution?",
                            "optionList": [
                                {"label": "Extremely practical and useful", "points": 5},
                                {"label": "Very practical", "points": 4},
                                {"label": "Moderately practical", "points": 3},
                                {"label": "Limited practicality", "points": 2},
                                {"label": "Not practical", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 2,
                    "title": "Presentation Quality",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How professional and engaging is the booth presentation?",
                            "optionList": [
                                {"label": "Excellent - Very engaging", "points": 5},
                                {"label": "Good - Well presented", "points": 4},
                                {"label": "Average - Acceptable", "points": 3},
                                {"label": "Below average", "points": 2},
                                {"label": "Poor - Unengaging", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How knowledgeable and helpful is the staff?",
                            "optionList": [
                                {"label": "Extremely knowledgeable", "points": 5},
                                {"label": "Very knowledgeable", "points": 4},
                                {"label": "Moderately knowledgeable", "points": 3},
                                {"label": "Limited knowledge", "points": 2},
                                {"label": "Poor knowledge", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 3,
                    "title": "Market Potential",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "What is the commercial viability and market potential?",
                            "optionList": [
                                {"label": "High market potential", "points": 5},
                                {"label": "Good market potential", "points": 4},
                                {"label": "Moderate market potential", "points": 3},
                                {"label": "Limited market potential", "points": 2},
                                {"label": "Low market potential", "points": 1}
                            ]
                        }
                    ]
                }
            ],
            "isTemplate": True
        }
        
        # Sample Template 3: Conference Presentation Evaluation
        template3 = {
            "questionnaireID": str(uuid.uuid4()),
            "userID": user_id,
            "title": "Conference Presentation Evaluation",
            "eventID": None,
            "criteriaList": [
                {
                    "criteriaID": 1,
                    "title": "Content Quality",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How relevant and valuable is the content?",
                            "optionList": [
                                {"label": "Extremely valuable content", "points": 5},
                                {"label": "Very valuable", "points": 4},
                                {"label": "Moderately valuable", "points": 3},
                                {"label": "Somewhat valuable", "points": 2},
                                {"label": "Not valuable", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How well-structured and organized is the presentation?",
                            "optionList": [
                                {"label": "Excellent structure", "points": 5},
                                {"label": "Good structure", "points": 4},
                                {"label": "Average structure", "points": 3},
                                {"label": "Poor structure", "points": 2},
                                {"label": "No clear structure", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 2,
                    "title": "Delivery & Communication",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How effective is the speaker's delivery and communication?",
                            "optionList": [
                                {"label": "Excellent delivery - Very engaging", "points": 5},
                                {"label": "Good delivery", "points": 4},
                                {"label": "Average delivery", "points": 3},
                                {"label": "Below average delivery", "points": 2},
                                {"label": "Poor delivery", "points": 1}
                            ]
                        },
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How well does the speaker handle questions and interaction?",
                            "optionList": [
                                {"label": "Excellent Q&A handling", "points": 5},
                                {"label": "Good Q&A handling", "points": 4},
                                {"label": "Average Q&A handling", "points": 3},
                                {"label": "Poor Q&A handling", "points": 2},
                                {"label": "Avoided or mishandled Q&A", "points": 1}
                            ]
                        }
                    ]
                },
                {
                    "criteriaID": 3,
                    "title": "Visual Aids & Technology",
                    "questionnaireID": "",
                    "questionList": [
                        {
                            "questionID": str(uuid.uuid4()),
                            "title": "How effective are the slides and visual aids?",
                            "optionList": [
                                {"label": "Excellent visual aids", "points": 5},
                                {"label": "Good visual aids", "points": 4},
                                {"label": "Average visual aids", "points": 3},
                                {"label": "Poor visual aids", "points": 2},
                                {"label": "No or confusing visual aids", "points": 1}
                            ]
                        }
                    ]
                }
            ],
            "isTemplate": True
        }
        
        # Save all templates to Firestore
        templates = [template1, template2, template3]
        created_templates = []
        
        for template in templates:
            # Set the criteriaList questionnaireID for each criteria
            for criteria in template["criteriaList"]:
                criteria["questionnaireID"] = template["questionnaireID"]
            
            doc_ref = db.collection('templates').document(template["questionnaireID"])
            doc_ref.set(template)
            created_templates.append({
                "templateID": template["questionnaireID"],
                "title": template["title"]
            })
        
        return jsonify({
            "status": "success",
            "message": "Sample templates created successfully",
            "templates": created_templates
        }), 200
        
    except Exception as e:
        print(f"Error creating sample templates: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# API: /template/getAllTemplates
# Frontend calls this API in order to retrieve all templates from Firestore (TODO - make it organizer-specific)
@template_bp.route('/getAllTemplates', methods=['GET'])
def getAllTemplates():
    user_id = request.args.get('userID')

    if not user_id:
        return jsonify({"error": "Missing userID parameter"}), 400

    try:
        templates_ref = db.collection('templates')
        query = templates_ref.where('userID', '==', user_id)
        results = query.stream()

        templates = []
        for doc in results:
            template_data = doc.to_dict()
            template_data['templateID'] = doc.id
            templates.append(template_data)

        return jsonify({
            "status": "success",
            "templates": templates
        }), 200

    except Exception as e:
        print(f"Error retrieving templates: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# API: /template/delete
# Frontend calls this API in order to delete a template from Firestore
@template_bp.route('/delete', methods=['POST'])
def delete_template():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    template_id = data.get('templateID')
    user_id = data.get('userID')
    
    if not template_id or not user_id:
        return jsonify({"error": "Missing templateID or userID"}), 400

    try:
        # Get reference to the template document
        template_ref = db.collection('templates').document(template_id)
        template_doc = template_ref.get()
        
        # Check if template exists
        if not template_doc.exists:
            return jsonify({"error": "Template not found"}), 404
        
        # Verify that the template belongs to the user
        template_data = template_doc.to_dict()
        if template_data.get('userID') != user_id:
            return jsonify({"error": "Unauthorized: Template does not belong to this user"}), 403
        
        # Delete the template
        template_ref.delete()
        
        return jsonify({
            "status": "success",
            "message": "Template deleted successfully"
        }), 200

    except Exception as e:
        print(f"Error deleting template: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# API: /template/save
# Frontend calls this API in order to save the Questionnaire as template for an organizer in Firestore
@template_bp.route('/save', methods=['POST'])
def save_questionnaireAsTemplate():
    data = request.get_json()
    userID = data['userID']
    questionnaire = data['Questionnaire']
    template_title = data.get('templateTitle', '').strip()
    print(data)

    if not userID or not questionnaire:
        return jsonify({"error": "Missing userID or Questionnaire"}), 400

    if not template_title:
        return jsonify({"error": "Template title is required"}), 400

    try:
        doc_ref = db.collection('templates').document()

        questionnaire['questionnaireID'] = doc_ref.id
        questionnaire['userID'] = userID
        questionnaire['title'] = template_title

        # Save to Firestore
        doc_ref.set(questionnaire)

        return jsonify({
            "status": "success",
            "message": "Template saved",
            "questionnaireID": doc_ref.id
        }), 200

    except Exception as e:
        print(f"Error saving questionnaire: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
