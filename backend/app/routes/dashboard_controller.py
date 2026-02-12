from flask import Blueprint,jsonify,request
from app.firebase import db
from datetime import datetime

# blueprints allow the app to split routes into different files/modules
# they can be imported in app.py (__init__)
dashboard_bp = Blueprint('dashboard_bp', __name__,url_prefix='/dashboard')


# --- APIs --- #


# API: /getDashboardData
# Frontend calls this API in order to get all votes of a specific event
@dashboard_bp.route('/getDashboardData', methods=['GET'])
def getDashboardData():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400
    
    print(f"Fetching dashboard data for eventID: {eventID}")

    try:
        # Try to fetch event by document ID first (most common case)
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        event_data = None
        
        if event_doc.exists:
            event_data = event_doc.to_dict()
            event_data['id'] = event_doc.id
            print("Found event by document ID")
        else:
            # If not found by document ID, try querying by eventID field
            event_query = db.collection('events').where('eventID', '==', eventID).limit(1)
            event_docs = event_query.stream()
            for doc in event_docs:
                event_data = doc.to_dict()
                event_data['id'] = doc.id
                print("Found event by eventID field")
                break
        
        if event_data is None:
            print(f"Event not found for eventID: {eventID}")
            return jsonify({'error': 'Event not found for this eventID'}), 404
        
        print(f"Event data: {event_data}")

        # Normalize event data structure (handle different naming conventions)
        if 'itemList' not in event_data and 'posterList' in event_data:
            event_data['itemList'] = event_data['posterList']
        elif 'itemList' not in event_data:
            event_data['itemList'] = []

        # fetch specific questionnaire
        questionnaire_id = event_data.get('questionnaireID')
        if not questionnaire_id:
            print("No questionnaireID found in event data")
            return jsonify({'error': 'No questionnaire associated with this event'}), 400

        # Try to fetch questionnaire by document ID first
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire_doc = questionnaire_ref.get()
        questionnaire_data = None

        if questionnaire_doc.exists:
            questionnaire_data = questionnaire_doc.to_dict()
            print("Found questionnaire by document ID")
        else:
            # If not found by document ID, try querying by eventID
            questionnaire_query = db.collection('questionnaires').where('eventID', '==', eventID).limit(1)
            questionnaire_docs = questionnaire_query.stream()
            for doc in questionnaire_docs:
                questionnaire_data = doc.to_dict()
                print("Found questionnaire by eventID field")
                break

        if questionnaire_data is None:
            print(f"Questionnaire not found for questionnaireID: {questionnaire_id}")
            return jsonify({'error': 'Questionnaire not found for this event'}), 404

        print(f"Questionnaire data: {questionnaire_data}")

        # Ensure questionnaire has the required structure
        if 'criteriaList' not in questionnaire_data:
            questionnaire_data['criteriaList'] = []

        # fetch all votes for this specific event
        vote_ref = db.collection('votes').where('eventID', '==', eventID)
        votes = vote_ref.stream()
        vote_list = []
        for vote in votes:
            vote_data = vote.to_dict()
            
            # Ensure vote has required fields
            if 'ticketOptionsList' not in vote_data:
                vote_data['ticketOptionsList'] = []
            if 'role' not in vote_data:
                vote_data['role'] = 'anonymous'
            
            vote_list.append(vote_data)

        print(f"Found {len(vote_list)} votes")

        response_data = {
            'event': event_data,
            'questionnaire': questionnaire_data,
            'votes': vote_list,
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error fetching dashboard data: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/getAllPendingOrRunningEvents
# Frontend calls this API in order to get
# all pending events (to start them) and running events (to end them)
# from an organizer
@dashboard_bp.route('/getAllPendingOrRunningEvents', methods=['GET'])
def get_all_pending_or_running_events():
    user_id = request.args.get('userID')
    if not user_id:
        return jsonify({'error': 'userID is required'}), 400

    try:
        events_ref = db.collection('events').where('organizerID', '==', user_id)
        docs = events_ref.stream()

        result = []

        for doc in docs:
            data = doc.to_dict()
            if data.get('status') in ['pending', 'running']:
                event = data.copy()
                # Ensure eventID is set (use document ID if not present)
                if 'eventID' not in event:
                    event['eventID'] = doc.id
                result.append(event)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching pending/running events: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/startEvent
# Frontend calls this API in order to start a specific event
@dashboard_bp.route('/startEvent', methods=['POST'])
def startEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    try:
        # Try to update by document ID first
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        
        if event_doc.exists:
            event_ref.update({'status': 'running'})
            print(f"Event {eventID} status updated to running (by document ID)")
        else:
            # Try to find by eventID field and update
            events_query = db.collection('events').where('eventID', '==', eventID)
            events = events_query.stream()
            updated = False
            
            for event_doc in events:
                event_doc.reference.update({'status': 'running'})
                updated = True
                print(f"Event {eventID} status updated to running (by eventID field)")
                break
            
            if not updated:
                return jsonify({'error': f'Event {eventID} not found'}), 404

        return jsonify({'message': f'Event {eventID} marked as running'}), 200

    except Exception as e:
        print(f"Error starting event: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


# API: /dashboard/endEvent
# Frontend calls this API in order to end a specific event
@dashboard_bp.route('/endEvent', methods=['POST'])
def endEvent():
    eventID = request.args.get('eventID')
    if not eventID:
        return jsonify({'error': 'eventID is required'}), 400

    try:
        # Try to update by document ID first
        event_ref = db.collection('events').document(eventID)
        event_doc = event_ref.get()
        
        end_date = datetime.now().isoformat()
        
        if event_doc.exists:
            event_ref.update({
                'status': 'ended',
                'endDate': end_date
            })
            print(f"Event {eventID} status updated to ended (by document ID)")
        else:
            # Try to find by eventID field and update
            events_query = db.collection('events').where('eventID', '==', eventID)
            events = events_query.stream()
            updated = False
            
            for event_doc in events:
                event_doc.reference.update({
                    'status': 'ended',
                    'endDate': end_date
                })
                updated = True
                print(f"Event {eventID} status updated to ended (by eventID field)")
                break
            
            if not updated:
                return jsonify({'error': f'Event {eventID} not found'}), 404

        return jsonify({'message': f'Event {eventID} marked as ended'}), 200

    except Exception as e:
        print(f"Error ending event: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@dashboard_bp.route('/getAllEndedEvents', methods=['GET'])
def get_all_ended_events():
    user_id = request.args.get('userID')
    if not user_id:
        return jsonify({'error': 'userID is required'}), 400

    try:
        events_ref = db.collection('events').where('organizerID', '==', user_id)
        docs = events_ref.stream()

        result = []

        for doc in docs:
            data = doc.to_dict()
            if data.get('status') == 'ended':
                event = data.copy()
                if 'eventID' not in event:
                    event['eventID'] = doc.id
                
                event_id = event['eventID']
                
                vote_ref = db.collection('votes').where('eventID', '==', event_id)
                votes = list(vote_ref.stream())
                event['totalVotes'] = len(votes)
                
                item_list = event.get('itemList', [])
                event['totalPosters'] = len(item_list)
                
                if 'endDate' not in event:
                    event['endDate'] = 'Recently ended'
                
                result.append(event)

        result.sort(key=lambda x: x.get('eventName', ''))

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching ended events: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@dashboard_bp.route('/getEventResults', methods=['GET'])
def get_event_results():
    event_id = request.args.get('eventID')
    if not event_id:
        return jsonify({'error': 'eventID is required'}), 400

    try:
        event_ref = db.collection('events').document(event_id)
        event_doc = event_ref.get()
        event_data = None
        
        if event_doc.exists:
            event_data = event_doc.to_dict()
            event_data['id'] = event_doc.id
        else:
            event_query = db.collection('events').where('eventID', '==', event_id).limit(1)
            event_docs = event_query.stream()
            for doc in event_docs:
                event_data = doc.to_dict()
                event_data['id'] = doc.id
                break
        
        if event_data is None:
            return jsonify({'error': 'Event not found'}), 404
        
        if event_data.get('status') != 'ended':
            return jsonify({'error': 'Event is not ended yet'}), 400

        questionnaire_id = event_data.get('questionnaireID')
        if not questionnaire_id:
            return jsonify({'error': 'No questionnaire associated with this event'}), 400

        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire_doc = questionnaire_ref.get()
        questionnaire_data = None

        if questionnaire_doc.exists:
            questionnaire_data = questionnaire_doc.to_dict()
        else:
            questionnaire_query = db.collection('questionnaires').where('eventID', '==', event_id).limit(1)
            questionnaire_docs = questionnaire_query.stream()
            for doc in questionnaire_docs:
                questionnaire_data = doc.to_dict()
                break

        if questionnaire_data is None:
            return jsonify({'error': 'Questionnaire not found for this event'}), 404

        vote_ref = db.collection('votes').where('eventID', '==', event_id)
        votes = vote_ref.stream()
        vote_list = []
        for vote in votes:
            vote_data = vote.to_dict()
            vote_list.append(vote_data)

        item_list = event_data.get('itemList', [])
        criteria_list = questionnaire_data.get('criteriaList', [])
        
        if not criteria_list:
            criteria_ref = db.collection('questionnaires').document(questionnaire_id).collection('criteria')
            for criteria_doc in criteria_ref.stream():
                criteria_data = criteria_doc.to_dict()
                criteria_data['criteriaID'] = criteria_doc.id
                
                # Get questions for this criteria
                questions_ref = criteria_ref.document(criteria_doc.id).collection('questions')
                question_list = []
                for question_doc in questions_ref.stream():
                    question_data = question_doc.to_dict()
                    question_data['questionID'] = question_doc.id
                    question_list.append(question_data)
                
                criteria_data['questionList'] = question_list
                criteria_list.append(criteria_data)
        
        results = {
            'event': event_data,
            'questionnaire': questionnaire_data,
            'totalVotes': len(vote_list),
            'posterResults': [],
            'overallStats': {
                'totalPosters': len(item_list),
                'averageScore': 0,
                'highestScoringPoster': None,
                'votingParticipation': {
                    'referee': 0,
                    'anonymous': 0
                }
            }
        }

        for vote in vote_list:
            role = vote.get('role', 'anonymous')
            if role == 'referee':
                results['overallStats']['votingParticipation']['referee'] += 1
            else:
                results['overallStats']['votingParticipation']['anonymous'] += 1
        total_scores = []
        for item in item_list:
            poster_id = str(item.get('PosterID', ''))
            poster_votes = [v for v in vote_list if str(v.get('itemID', '')) == poster_id]
            
            poster_result = {
                'posterID': poster_id,
                'posterName': item.get('Title', f'Poster {poster_id}'),
                'totalVotes': len(poster_votes),
                'averageScore': 0,
                'scoreBreakdown': [],
                'criteriaScores': []
            }

            total_poster_score = 0
            total_possible_score = 0
            for criteria in criteria_list:
                criteria_id = criteria.get('criteriaID')
                criteria_title = criteria.get('title', f'Criteria {criteria_id}')
                question_list = criteria.get('questionList', [])
                
                if not question_list:
                    question_list = criteria.get('question_list', [])

                criteria_score = 0
                criteria_max_score = 0
                question_scores = []

                for question in question_list:
                    question_id = question.get('questionID')
                    question_title = question.get('title', f'Question {question_id}')
                    
                    option_list = question.get('optionList', [])
                    if not option_list:
                        option_list = question.get('option_list', [])
                    
                    max_points = max([opt.get('points', 0) for opt in option_list], default=0)
                    criteria_max_score += max_points

                    question_total = 0
                    question_count = 0

                    for vote in poster_votes:
                        ticket_options = vote.get('ticketOptionsList', [])
                        for ticket in ticket_options:
                            if ticket.get('questionTitle') == question_title:
                                question_total += ticket.get('points', 0)
                                question_count += 1

                    avg_question_score = question_total / question_count if question_count > 0 else 0
                    criteria_score += avg_question_score
                    question_scores.append({
                        'questionID': question_id,
                        'questionTitle': question_title,
                        'averageScore': round(avg_question_score, 2),
                        'maxScore': max_points,
                        'responses': question_count
                    })

                poster_result['criteriaScores'].append({
                    'criteriaID': criteria_id,
                    'criteriaTitle': criteria_title,
                    'averageScore': round(criteria_score, 2),
                    'maxScore': criteria_max_score,
                    'questions': question_scores
                })

                total_poster_score += criteria_score
                total_possible_score += criteria_max_score

            poster_result['averageScore'] = round(total_poster_score, 2)
            poster_result['maxPossibleScore'] = total_possible_score
            poster_result['scorePercentage'] = round((total_poster_score / total_possible_score * 100), 2) if total_possible_score > 0 else 0

            results['posterResults'].append(poster_result)
            total_scores.append(total_poster_score)

        if total_scores:
            results['overallStats']['averageScore'] = round(sum(total_scores) / len(total_scores), 2)
            
            if results['posterResults']:
                highest_poster = max(results['posterResults'], key=lambda x: x['averageScore'])
                results['overallStats']['highestScoringPoster'] = {
                    'name': highest_poster['posterName'],
                    'score': highest_poster['averageScore']
                }

        return jsonify(results), 200

    except Exception as e:
        print(f"Error fetching event results: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


