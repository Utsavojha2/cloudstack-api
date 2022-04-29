import { Controller, Get, Query } from "@nestjs/common";
import { UserService } from "./user.service";


@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/users')
    async getAllUsers() {
        return await this.userService.findAllUsers();
    }

    @Get('/users/:id')
    async getUser(@Query('id') id: string) {
        return await this.userService.findOneUser({ id });
    }
}