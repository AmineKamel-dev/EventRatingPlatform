from flask import Blueprint,jsonify,request
from app.firebase import db
import uuid

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
vote_bp = Blueprint('vote_bp', __name__)


# --- APIs --- #


# API: /questionnaireID/posterID
# Frontend calls this API in order to retreive questionnaire and event data
# from Firestore in order to render the Voting Questionnaire for the Referee.
@vote_bp.route('/<questionnaireID>/<posterID>', methods=['GET'])
def getQuestionnaireAndEvent(questionnaireID, posterID):
    try:
        # Get questionnaire
        questionnaire_ref = db.collection("questionnaires").document(questionnaireID)
        questionnaire_doc = questionnaire_ref.get()

        if not questionnaire_doc.exists:
            return jsonify({"error": "Questionnaire not found"}), 404

        questionnaire_data = questionnaire_doc.to_dict()

        eventID = questionnaire_data.get("eventID")
        if not eventID:
            return jsonify({"error": "eventID not found in questionnaire"}), 400

        event_ref = db.collection("events").document(eventID)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            return jsonify({"error": "Event not found"}), 404
            
        event_data = event_doc.to_dict()
        
        event_status = event_data.get("status", "")
        if event_status == "ended":
            return jsonify({"error": "EVENT_ENDED", "message": "This event has already ended and voting is no longer available."}), 403

        return jsonify({
            "questionnaire": questionnaire_data,
            "event": event_data,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# API: /submitVote
# Frontend calls this API in order to store the vote-data into Firestore
@vote_bp.route('/submitVote', methods=['POST'])
def submit_vote():
    try:
        data = request.get_json()

        voteID = str(uuid.uuid4())
        itemID = data.get('itemID')  # posterID
        questionnaireID = data.get('questionnaireID')
        eventID = data.get('eventID')
        ticketOptionsList = data.get('ticketOptionsList')
        role = data.get('role', '')

        if not itemID or not ticketOptionsList or not questionnaireID or not eventID:
            return jsonify({'error': 'Missing required fields'}), 400

        event_ref = db.collection("events").document(eventID)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            return jsonify({'error': 'Event not found'}), 404
            
        event_data = event_doc.to_dict()
        event_status = event_data.get("status", "")
        
        if event_status == "ended":
            return jsonify({'error': 'EVENT_ENDED', 'message': 'This event has ended and no longer accepts votes.'}), 403

        vote_doc = {
            'voteID': voteID,
            'itemID': itemID,
            'questionnaireID': questionnaireID,
            'eventID': eventID,
            'ticketOptionsList': ticketOptionsList,
            'role': role,
        }

        db.collection('votes').document(voteID).set(vote_doc)

        return jsonify({'message': 'Vote submitted successfully', 'voteID': voteID}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500