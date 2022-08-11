import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthConroller } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthConroller],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}