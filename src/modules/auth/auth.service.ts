import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async signup(data: any) {
    const userId = data.id;
    // Save user in Firestore
    await this.firebaseService.createUser(userId, data);

    // Generate JWT
    const payload = { sub: userId, email: data.email };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async login(userId: string) {
    const user = await this.firebaseService.getUser(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: userId, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
