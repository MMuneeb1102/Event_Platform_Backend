import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventModule } from './modules/event/event.module';
@Module({
  imports: [FirebaseModule, AuthModule, EventModule],
})
export class AppModule {}
