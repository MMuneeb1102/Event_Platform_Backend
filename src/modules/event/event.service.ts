import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class EventService {
  private firestore: admin.firestore.Firestore;
  constructor(private readonly firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestoreInstance();
  }

  async createEvent(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<any> {
    const { title, description, date, time } = createEventDto;
    // if(!description){

    // }
    const data = await this.firestore.collection('events').add({
      title: title,
      description: description ? description : '',
      eventDate: date,
      time: time,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      message: 'Event created successfully',
      success: true,
    };
  }
}
