import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class EventService {
  private firestore: admin.firestore.Firestore;
  constructor(private readonly firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestoreInstance();
  }

  async createEvent(
    createEventDto: CreateEventDto,
    userId: string,
  ) {
    try {
      const { title, description, date, time, location } = createEventDto;

      let bodyData = {
        _id: uuidv4(),
        title: title,
        description: description ? description : '',
        eventDate: date,
        time: time,
        location: location,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      await this.firestore.collection('events').doc(bodyData._id).set(bodyData);

      await this.firestore.collection('eventParticipants').doc(bodyData._id).set({
        _id: bodyData._id,
        eventId: bodyData._id,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      let responseMessage = {
        message: 'Event created successfully',
        ...bodyData
      }

      return responseMessage

    } catch (error) {
      throw new Error("Something went wrong")
    }
  }

  async addComment(
    addCommentDto: AddCommentDto,
    userId: string,
    eventId: string,
  ): Promise<any> {
    try {
      const { comment } = addCommentDto;

      const doc = await this.firestore.collection('events').doc(eventId).get();

      if (!doc.exists) {
        throw new NotFoundException('Event not found');
      }

      const commentId = uuidv4();

      const commentData = {
        _id: commentId,
        userId: userId,
        eventId: eventId,
        comment: comment,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.firestore
        .collection('eventComments')
        .doc(commentId)
        .set(commentData);

      // 🔍 Fetch user's name from users collection
      const userDoc = await this.firestore.collection('users').doc(userId).get();
      let userName = 'Unknown';
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.name) {
          userName = userData.name;
        }
      }

      // ✅ Return full info
      return {
        message: 'Comment added successfully',
          _id: commentId,
          comment: comment,
          name: userName,
          eventId: eventId,
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('[addComment] Error:', error);
      throw new InternalServerErrorException('Failed to add comment');
    }
  }


  async joinEvent(eventId: string, userId: string): Promise<any> {
    try {
      const eventDoc = await this.firestore.collection('events').doc(eventId).get();

      if (!eventDoc.exists) {
        throw new NotFoundException('Event not found');
      }

      const existingParticipantSnap = await this.firestore
        .collection('eventParticipants')
        .where('eventId', '==', eventId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!existingParticipantSnap.empty) {
        throw new ConflictException('User already joined this event');
      }

      const _id = uuidv4();

      await this.firestore.collection('eventParticipants').doc(_id).set({
        _id,
        eventId,
        userId,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        message: 'User successfully joined the event',
        participantId: _id,
      };

    } catch (error) {
      console.error('[joinEvent] Error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to join event');
    }
  }

  async getAllEvents(): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection('events').get();

      let events: any[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.createdAt?.toDate) {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        events.push(data);

      });

      return events;
    } catch (error) {
      console.error('[getAllEvents] Error:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  async getEventById(eventId: string): Promise<any> {
    try {
      const doc = await this.firestore.collection('events').doc(eventId).get();

      if (!doc.exists) {
        throw new NotFoundException('Event not found');
      }

      const data = doc.data();

      if (data?.createdAt?.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }

      return data
    } catch (error) {
      console.error('[getEventById] Error:', error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }


  async myEvents(userId: string): Promise<any[]> {
    try {
      const snapshot = await this.firestore
        .collection('events')
        .where('userId', '==', userId)
        .get();

      const events: any[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();

        if (data.createdAt?.toDate) {
          data.createdAt = data.createdAt.toDate().toISOString();
        }

        events.push(data);
      });

      return events;
    } catch (error) {
      console.error('[myEvents] Error:', error);
      throw new InternalServerErrorException('Failed to fetch user events');
    }
  }

  async getAllComments(eventId: string): Promise<any[]> {
    try {
      const snapshot = await this.firestore
        .collection('eventComments')
        .where('eventId', '==', eventId)
        .get();

      const comments: any[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();

        if (data.createdAt?.toDate) {
          data.createdAt = data.createdAt.toDate().toISOString();
        }

        // 🔍 Get user name from userId
        let userName = 'Unknown';
        if (data.userId) {
          const userDoc = await this.firestore.collection('users').doc(data.userId).get();
          const userData = userDoc.data();
          if (userData && userData.name) {
            userName = userData.name;
          }
        }

        comments.push({
          id: doc.id,
          ...data,
          name: userName, // 👈 Attach user name
        });
      }

      return comments;
    } catch (error) {
      console.error('[getAllComments] Error:', error);
      throw new InternalServerErrorException('Failed to fetch comments');
    }
  }

}
