import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event';
import { AuthGuard } from '../auth/auth.guard';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create-event')
  @UseGuards(AuthGuard)
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    const userId: string = req.user.id;
    // console.log(userId);
    return this.eventService.createEvent(createEventDto, userId);
  }

  @Post('add-comment/:eventId')
  @UseGuards(AuthGuard)
  async addComment(@Body() addCommentDto: AddCommentDto, @Param('eventId') eventId: string, @Req() req: any) {
    const userId: string = req.user.id;

    console.log(eventId);
    return this.eventService.addComment(addCommentDto, userId, eventId);
  
  }

  @Post('join-event/:eventId')
  @UseGuards(AuthGuard)
  async joinEvent(@Param('eventId') eventId: string, @Req() req: any) {
    const userId: string = req.user.id;

    console.log(eventId);
    return this.eventService.joinEvent(eventId, userId);
  }

  @Get('getall')
  @UseGuards(AuthGuard)
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @Get('get-event/:eventId')
  @UseGuards(AuthGuard)
  async getEventById(@Param('eventId') eventId: string) {
    return this.eventService.getEventById(eventId);
  }

  @Get('myevents')
  @UseGuards(AuthGuard)
  async myEvents(@Req() req: any) {
    const userId: string = req.user.id;
    return this.eventService.myEvents(userId);
  }

  @Get('comments/getall/:eventId')
  @UseGuards(AuthGuard)
  async getAllComments(@Param('eventId') eventId: string) {
    return this.eventService.getAllComments(eventId);
  }
}
