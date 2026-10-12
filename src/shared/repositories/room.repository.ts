import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Room } from '../entities/room.entity.js';

@Injectable()
export class RoomRepository extends Repository<Room> {
  constructor(dataSource: DataSource) {
    super(Room, dataSource.createEntityManager());
  }
}
