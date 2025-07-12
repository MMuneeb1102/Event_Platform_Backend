import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event';
import { AuthGuard } from '../auth/auth.guard';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create-event')
  @UseGuards(AuthGuard)
  createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    const userId: string = req.user.id;
    console.log(req);
    // console.log(userId);
    // this.eventService.createEvent(createEventDto, userId);
  }
}
