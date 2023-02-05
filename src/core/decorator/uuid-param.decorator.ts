import { HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';

const uuidPipe = new ParseUUIDPipe({
  errorHttpStatusCode: HttpStatus.NOT_FOUND,
});

export function UUIDParam(property: string): ParameterDecorator {
  return Param(property, uuidPipe);
}
