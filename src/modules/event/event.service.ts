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
      const { title, description, date, time } = createEventDto;

      let bodyData = {
        _id: uuidv4(),
        title: title,
        description: description ? description : '',
        eventDate: date,
        time: time,
        userId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      await this.firestore.collection('events').doc(bodyData._id).set(bodyData);

      await this.firestore.collection('eventParticipants').doc(bodyData._id).set({
        _id: uuidv4(),
        eventId: bodyData._id,
        userId: userId
      });



      let responseMessage = {
        message: 'Event created successfully',
        eventId: bodyData._id
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

      console.log(commentData)

      await this.firestore
        .collection('eventComments')
        .doc(commentId)
        .set(commentData);

      return {
        message: 'Comment added successfully',
        commentId,
      };

    } catch (error) {
      if (
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to add comment');
    }
  }

  async joinEvent(eventId: string, userId: string): Promise<any> {
    try {
      const eventDoc = await this.firestore.collection('events').doc(eventId).get();

      if (!eventDoc.exists) {
        throw new NotFoundException('Event not found');
      }

      // Step 2: Check if user already joined this event
      const existingParticipantSnap = await this.firestore
        .collection('eventParticipants')
        .where('eventId', '==', eventId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!existingParticipantSnap.empty) {
        throw new ConflictException('User already joined this event');
      }

      // Step 3: Add participant
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
}
