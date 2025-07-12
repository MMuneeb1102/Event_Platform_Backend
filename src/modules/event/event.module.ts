import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [FirebaseModule, JwtModule],
  controllers: [EventController],
  providers: [EventService, FirebaseService],
})
export class EventModule {}
