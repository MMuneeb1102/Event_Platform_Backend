import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from './firebase-secret.json';

@Injectable()
export class FirebaseService {
  private firestore: admin.firestore.Firestore;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.firestore = admin.firestore();
  }

  getFirestoreInstance() {
    return this.firestore;
  }

  // Firestore CRUD examples

  // async createUser(userId: string, data: any) {
  //   await this.firestore.collection('users').doc(userId).set(data);
  // }

  // async getUser(userId: string) {
  //   const doc = await this.firestore.collection('users').doc(userId).get();
  //   return doc.exists ? doc.data() : null;
  // }

  // async updateUser(userId: string, data: any) {
  //   await this.firestore.collection('users').doc(userId).update(data);
  // }

  // async deleteUser(userId: string) {
  //   await this.firestore.collection('users').doc(userId).delete();
  // }
}
