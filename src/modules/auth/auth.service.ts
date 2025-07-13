import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private firestore: admin.firestore.Firestore;
  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.firestore = this.firebaseService.getFirestoreInstance();
  }

  async signup(createUserDto: CreateUserDto, res: Response) {
    try {
      const { name, email, password, confirmPassword } = createUserDto;

      // console.log(createUserDto);
      if (password !== confirmPassword) {
        throw new ConflictException('Passwords do not match');
      }

      const existingUserSnap = await this.firestore
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingUserSnap.empty) {
        throw new ConflictException('Email is already in use');
      }
      const salt = await genSalt(10);

      const securePass = await hash(password, salt);

      const userData = {
        _id: uuidv4(),
        name: name,
        email: email,
        password: securePass,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }

      await this.firestore.collection('users').doc(userData._id).set(userData);

      const userId = userData._id;
      const payload = {
        id: userId,
      };

      const secret = this.configService.get('MY_SECRET_KEY');

      const token = this.jwtService.sign(payload, { secret });

      res.cookie('token', token, {
        httpOnly: false,
        secure: false, 
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return {
        message: 'User created successfully!',
        token,
      };
    } catch (error) {
      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException('Something went wrong');
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    try {
      const { email, password } = loginUserDto;
      const existingUserSnap = await this.firestore
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (existingUserSnap.empty) {
        throw new BadRequestException('invalid email');
      }

      const doc = existingUserSnap.docs[0];
      const existingUser = doc.data();

      const passwordCompare = await compare(password, existingUser.password);

      if (!passwordCompare) {
        throw new BadRequestException('incorrect password');
      }

      const data = {
        id: existingUser._id,
      };

      console.log(existingUser);

      const secret = await this.configService.get('MY_SECRET_KEY');
      const token = this.jwtService.sign(data, { secret });

       res.cookie('token', token, {
        httpOnly: false,
        secure: false, 
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return {
        message: 'login successful',
        token,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const userDoc = await this.firestore.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      const userData = userDoc.data();

      if (userData?.password) {
      delete userData.password;
    }

      if (userData?.createdAt) {
      delete userData.createdAt;
    }

    // if (userData?.createdAt?.toDate) {
    //   userData.createdAt = userData.createdAt.toDate().toISOString();
    // }

      return {
        ...userData
      };
    } catch (error) {
      console.error('[getUser] Error:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}
