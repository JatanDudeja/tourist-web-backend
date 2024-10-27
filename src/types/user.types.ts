import { Request } from "express";
import { Document } from "mongoose";

export interface UserLoginDTO extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface AccessAndRefreshTokenDTO {
  accessToken: string;
  refreshToken: string;
}

export interface UserDTO extends Document {
  name: string;
  email: string;
  password: string;
  checkPassword(userEnteredPassword: string): Promise<boolean>;
  generateToken(userID: string, refreshToken?: boolean): string;
}