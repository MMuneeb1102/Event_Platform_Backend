import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase/users')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  //   @Post()
  //   // async createUser(@Body() body: any) {
  //   //   const userId = body.id;
  //   //   await this.firebaseService.createUser(userId, body);
  //   //   return { message: 'User created', userId };
  //   // }
  //   @Get(':id')
  //   async getUser(@Param('id') id: string) {
  //     const user = await this.firebaseService.getUser(id);
  //     if (!user) return { message: 'User not found' };
  //     return user;
  //   }

  //   @Put(':id')
  //   async updateUser(@Param('id') id: string, @Body() body: any) {
  //     await this.firebaseService.updateUser(id, body);
  //     return { message: 'User updated' };
  //   }

  //   @Delete(':id')
  //   async deleteUser(@Param('id') id: string) {
  //     await this.firebaseService.deleteUser(id);
  //     return { message: 'User deleted' };
  //   }
  // }
}
