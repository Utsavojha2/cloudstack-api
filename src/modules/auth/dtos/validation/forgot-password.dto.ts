import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./register-user.dto";

export class ForgotPasswordDto extends PickType(CreateUserDto, ['email'] as const) {}
