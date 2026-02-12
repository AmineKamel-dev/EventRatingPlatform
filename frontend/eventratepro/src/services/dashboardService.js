import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "../firebase/config";

export class DashboardService {
  constructor() {
    this.unsubscribeVotes = null;
    this.unsubscribeEvent = null;
  }

  subscribeToEventData(eventID, onDataUpdate, onError) {
    
    const aggregateData = async (eventData, votesData) => {
      try {
        if (!eventData) {
          return;
        }

        const questionnaireData = await this.getQuestionnaireData(
          eventData.questionnaireID,
          eventID
        );

        if (!questionnaireData) {
          onError("No questionnaire associated with this event");
          return;
        }

        if (!("itemList" in eventData) && "posterList" in eventData) {
          eventData["itemList"] = eventData["posterList"];
        } else if (!("itemList" in eventData)) {
          eventData["itemList"] = [];
        }

        if (!("criteriaList" in questionnaireData)) {
          questionnaireData["criteriaList"] = [];
        }

        const dashboardData = {
          event: eventData,
          questionnaire: questionnaireData,
          votes: votesData || [],
        };
        
        onDataUpdate(dashboardData);
      } catch (error) {
        onError("Failed to aggregate dashboard data: " + error.message);
      }
    };

    let eventData = null;
    let votesData = [];

    this.subscribeToEvent(
      eventID,
      (newEventData) => {
        eventData = newEventData;
        aggregateData(eventData, votesData);
      },
      onError
    );

    this.subscribeToVotes(
      eventID,
      (newVotesData) => {
        votesData = newVotesData;
        aggregateData(eventData, votesData);
      },
      onError
    );
  }

  subscribeToEvent(eventID, onEventUpdate, onError) {
    try {
      const eventRef = doc(db, "events", eventID);

      this.unsubscribeEvent = onSnapshot(
        eventRef,
        (doc) => {
          if (doc.exists()) {
            const eventData = doc.data();
            eventData.id = doc.id;
            onEventUpdate(eventData);
          } else {
            this.queryEventByEventID(eventID, onEventUpdate, onError);
          }
        },
        (error) => {
          onError("Error listening to event updates: " + error.message);
        }
      );
    } catch (error) {
      onError("Error setting up event listener: " + error.message);
    }
  }

  subscribeToVotes(eventID, onVotesUpdate, onError) {
    try {
      const votesQuery = query(
        collection(db, "votes"),
        where("eventID", "==", eventID)
      );

      this.unsubscribeVotes = onSnapshot(
        votesQuery,
        (snapshot) => {
          const votes = [];
          snapshot.forEach((doc) => {
            const voteData = doc.data();

            if (!voteData.ticketOptionsList) {
              voteData.ticketOptionsList = [];
            }
            if (!voteData.role) {
              voteData.role = "anonymous";
            }

            votes.push(voteData);
          });

          onVotesUpdate(votes);
        },
        (error) => {
          onError("Error listening to votes updates: " + error.message);
        }
      );
    } catch (error) {
      onError("Error setting up votes listener: " + error.message);
    }
  }

  async queryEventByEventID(eventID, onEventUpdate, onError) {
    try {
      const eventsQuery = query(
        collection(db, "events"),
        where("eventID", "==", eventID)
      );

      onSnapshot(
        eventsQuery,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const eventData = doc.data();
            eventData.id = doc.id;
            onEventUpdate(eventData);
          } else {
            onError("Event not found for this eventID");
          }
        },
        (error) => {
          onError("Error querying event: " + error.message);
        }
      );
    } catch (error) {
      onError("Error setting up event query: " + error.message);
    }
  }

  async getQuestionnaireData(questionnaireID, eventID) {
    try {
      const questionnaireRef = doc(db, "questionnaires", questionnaireID);
      const questionnaireDoc = await getDoc(questionnaireRef);

      if (questionnaireDoc.exists()) {
        return questionnaireDoc.data();
      } else {
        const questionnaireQuery = query(
          collection(db, "questionnaires"),
          where("eventID", "==", eventID)
        );

        const questionnaireSnapshot = await getDocs(questionnaireQuery);
        if (!questionnaireSnapshot.empty) {
          return questionnaireSnapshot.docs[0].data();
        } else {
          return null;
        }
      }
    } catch (error) {
      return null;
    }
  }

  unsubscribe() {
    if (this.unsubscribeVotes) {
      this.unsubscribeVotes();
      this.unsubscribeVotes = null;
    }

    if (this.unsubscribeEvent) {
      this.unsubscribeEvent();
      this.unsubscribeEvent = null;
    }
  }
}

export const dashboardService = new DashboardService();
