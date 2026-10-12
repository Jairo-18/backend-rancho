import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RoomImage } from '../entities/roomImage.entity.js';

@Injectable()
export class RoomImageRepository extends Repository<RoomImage> {
  constructor(dataSource: DataSource) {
    super(RoomImage, dataSource.createEntityManager());
  }
}
