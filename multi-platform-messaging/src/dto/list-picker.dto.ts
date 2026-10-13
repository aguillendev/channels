import { IsString, IsArray, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseMessageDto } from './base-message.dto';
import { MessageType } from '../interfaces/message-types.interface';

export class ListRow {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ListSection {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListRow)
  rows: ListRow[];
}

export class ListPickerDto extends BaseMessageDto {
  type = MessageType.LIST_PICKER;

  @IsString()
  text: string;

  @IsString()
  buttonText: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ListSection)
  sections: ListSection[];
}
