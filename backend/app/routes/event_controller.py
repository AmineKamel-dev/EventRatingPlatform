from flask import Blueprint,jsonify,request, send_file
from app.firebase import db
import uuid
from fpdf import FPDF
from io import BytesIO
from datetime import datetime


event_bp = Blueprint('event_bp', __name__,url_prefix='/event')


# --- APIs --- #


# API: /event/isRefereeOfEvent
# Frontend calls this API on order to save the given event-data into Firestore
@event_bp.route('/isRefereeOfEvent', methods=['POST'])
def isRefereeOfEvent():
    data = request.get_json()

    event_id = data.get("eventID")
    userEmail = data.get("userEmail")

    if not event_id or not userEmail:
        return jsonify({"error": "Missing eventID or email"}), 400

    try:
        # Get event document by eventID
        event_ref = db.collection("events").document(event_id)
        event_doc = event_ref.get()

        if not event_doc.exists:
            return jsonify({"error": "Event not found"}), 404

        event_data = event_doc.to_dict()
        referee_list = event_data.get("refereeList", [])

        # Check if email (case-insensitive) is in the referee list
        is_referee = any(
            r.lower() == userEmail.lower() for r in referee_list
        )

        return jsonify({"isReferee": is_referee})

    except Exception as e:
        print("Error verifying referee:", e)
        return jsonify({"error": "Internal server error"}), 500


# API: /event/save
# Frontend calls this API on order to save the given event-data into Firestore
@event_bp.route('/save', methods=['POST'])
def save_event():
    data = request.get_json()

    print("EVENT: ", data.get('event'))
    print("QUESTIONNAIRE: ", data.get('questionnaire'))

    event_data = data.get('event')
    questionnaire_data = data.get('questionnaire')
    event_title = data.get('eventTitle', '').strip() if data.get('eventTitle') else event_data.get('eventName', '').strip()

    if not event_data or not questionnaire_data:
        return jsonify({"status": "error", "message": "Missing event or questionnaire data"}), 400

    if not event_title:
        return jsonify({"status": "error", "message": "Event title is required"}), 400

    event_id = event_data.get('eventID')
    if not event_id:
        event_id = str(uuid.uuid4())
        event_data['eventID'] = event_id

    # Ensure event has a title
    event_data['eventName'] = event_title

    db.collection('events').document(event_id).set(event_data)

    questionnaire_id = questionnaire_data.get('questionnaireID')
    if not questionnaire_id:
        return jsonify({"status": "error", "message": "Missing questionnaireID"}), 400

    db.collection('questionnaires').document(questionnaire_id).set(questionnaire_data)

    return jsonify({
        "status": "success",
        "message": "Event and questionnaire saved successfully",
        "eventID": event_id,
        "questionnaireID": questionnaire_id
    }), 200


# API: /event/addRefereeToList
# Frontend calls this API in order to check if the provided
# referee is a real referee in Firestore
@event_bp.route('/addRefereeToList', methods=['GET'])
def addRefereeToList():
    email = request.args.get('email')

    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1).stream()

        user_doc = next(query, None)

        if not user_doc:
            return jsonify({"status": "not_found", "message": "User not found"}), 404

        user_data = user_doc.to_dict()

        if user_data.get('role') != 'referee':
            return jsonify({"status": "invalid_role", "message": "User is not a referee"}), 403

        return jsonify({
            "status": "success",
            "referee": {
                "userID": user_doc.id,
                "email": user_data['email'],
                "name": user_data.get('name', ''),
            }
        }), 200

    except Exception as e:
        print(f"Error validating referee: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@event_bp.route('/add', methods=['POST'])
def add_event():
    try:
        event_data = request.json
        # Validate required fields (basic)
        required_fields = ['eventID', 'questionnaireID', 'organizerID', 'itemList', 'refereeList', 'status']
        if not all(field in event_data for field in required_fields):
            return jsonify({"error": "Missing one or more required fields"}), 400
        
        # Store event document with eventID as document ID
        event_id = event_data['eventID']
        db.collection('events').document(event_id).set(event_data)
        
        return jsonify({"message": "Event added successfully", "eventID": event_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@event_bp.route('/get/<string:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        doc = db.collection('events').document(event_id).get()
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@event_bp.route('/update/<string:event_id>', methods=['PATCH'])
def update_event(event_id):
    try:
        updates = request.json  # Dict of fields to update/delete
        
        doc_ref = db.collection('events').document(event_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": "Event not found"}), 404

        # Handle field deletion if value is null or "_delete"
        fields_to_delete = [k for k, v in updates.items() if v in [None, "_delete"]]
        for field in fields_to_delete:
            doc_ref.update({field: firestore.DELETE_FIELD})
        
        # Filter out deleted fields before updating
        updates = {k: v for k, v in updates.items() if v not in [None, "_delete"]}
        if updates:
            doc_ref.update(updates)

        return jsonify({"message": "Event updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@event_bp.route('/QRCodeSaveUrl', methods=['POST'])
def save_qr_code_url():
    
    data = request.get_json()
    event_id = data.get('eventID')
    posters = data.get('posters', [])

    if not event_id or not posters:
        return jsonify({"status": "error", "message": "eventID and posters are required."}), 400

    try:
        
        event_ref = db.collection('events').document(event_id)
        for poster in posters:
            poster_id = str(uuid.uuid4())
            poster_data = {
                "name": poster.get("name", ""),
                "qrCodeUrl": poster.get("qrCodeUrl", "")
            }
            event_ref.collection('posters').document(poster_id).set(poster_data)
        return jsonify({"status": "ok", "message": "Posters saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@event_bp.route('/exportPDF/<string:event_id>', methods=['GET'])
def generatePDFData(event_id):
    """
    We will use FPDF library to generate the PDF data.
    Do in the Terminal to install library: pip install fpdf==1.7.2

    PDF will contain:
    - Event information
    - Questionnaire details
    - Poster QR codes
    """
    try:
        # Get event data
        event_ref = db.collection('events').document(event_id)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            return jsonify({"status": "error", "message": "Event not found"}), 404
            
        event_data = event_doc.to_dict()
        
        # Get questionnaire data
        questionnaire_id = event_data.get('questionnaireID')
        questionnaire_data = None
        if questionnaire_id:
            questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
            questionnaire_doc = questionnaire_ref.get()
            if questionnaire_doc.exists:
                questionnaire_data = questionnaire_doc.to_dict()
        
        # Get posters data
        posters = []
        posters_ref = event_ref.collection('posters')
        for poster_doc in posters_ref.stream():
            posters.append(poster_doc.to_dict())
        
        # Generate PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'EVENT REPORT', ln=True, align='C')
        pdf.ln(10)
        
        # Event information will be written 
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Event Information', ln=True)
        pdf.ln(5)
        
        pdf.set_font('Arial', '', 10)
        
        # Event information will be written in a table format
        event_info = [
            ['Event ID:', event_data.get('eventID', 'N/A')],
            ['Event Name:', event_data.get('eventName', 'N/A')],
            ['Organizer ID:', event_data.get('organizerID', 'N/A')],
            ['Status:', event_data.get('status', 'N/A')],
            
        ]
        
        
        # Create table
        col_width = [60, 120]
        for row in event_info:
            pdf.cell(col_width[0], 8, row[0], border=1)
            pdf.cell(col_width[1], 8, row[1], border=1, ln=True)
        
        pdf.ln(10)
        
        # Questionnaire information will be written in a table format
        if questionnaire_data:
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, 'Questionnaire Information', ln=True)
            pdf.ln(5)
            
            pdf.set_font('Arial', '', 10)
            pdf.cell(0, 8, f'Questionnaire ID: {questionnaire_data.get("questionnaireID", "N/A")}', ln=True)
            pdf.cell(0, 8, f'Is Template: {"Yes" if questionnaire_data.get("is_template") else "No"}', ln=True)
            pdf.ln(10)
        
        # Poster QR codes
        if posters:
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, 'Poster QR Codes', ln=True)
            pdf.ln(5)
            
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(70, 8, 'Poster Name', border=1)
            pdf.cell(110, 8, 'QR Code URL', border=1, ln=True)
            
            pdf.set_font('Arial', '', 9)
            for poster in posters:
                name = poster.get('name', 'No Name')
                url = poster.get('qrCodeUrl', 'No URL')
                
                # Shorten long URLs
                if len(url) > 50:
                    url = url[:47] + "..."
                
                pdf.cell(70, 8, name, border=1)
                pdf.cell(110, 8, url, border=1, ln=True)
        
        # Write PDF to buffer
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        # Create filename
        filename = f"event_report_{event_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
