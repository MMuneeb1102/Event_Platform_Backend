import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [FirebaseModule, AuthModule],
})
export class AppModule {}
