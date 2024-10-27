import { Request, Response } from "express";
import User from "../models/user.model.js";
import { APIErrors } from "../utils/apiErrors.js";
import {
  AccessAndRefreshTokenDTO,
  UserDTO,
  UserLoginDTO,
} from "../types/user.types.js";

export class UsersController {
  private readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly sqlInjectionRegex =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|AND|OR|EXEC|UNION|JOIN)\b|--|;|\/\*|\*\/|'|")/i;

  private generateAccesAndRefreshToken(
    userDetails: UserDTO
  ): AccessAndRefreshTokenDTO {
    const { _id: userID } = userDetails;
    const accessToken = userDetails?.generateToken(userID as string);
    const refreshToken = userDetails?.generateToken(userID as string, true);

    return {
      accessToken,
      refreshToken,
    };
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!email) {
      res.status(406).json({
        statusCode: 406,
        message: "Email is required",
      });
      return;
    }

    if (!password) {
      res.status(406).json({
        statusCode: 406,
        message: "Password is required",
      });
      return;
    }

    if (!name) {
      res.status(406).json({
        statusCode: 406,
        message: "Name is required",
      });
      return;
    }

    const doesUserExists = await User.findOne({ email });

    if (doesUserExists) {
      res.status(406).json({
        statusCode: 4,
        message: "User already exists",
      });
      return;
    }

    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
      });
      throw new APIErrors({ statusCode: 500, message: JSON.stringify(error) });
    }

    res.status(200).json({
      statusCode: 200,
      message: "User created successfully",
      data: user,
    });
  }

  async userLogin(req: UserLoginDTO, res: Response): Promise<void> {
    const { email, password } = req.body;

    if ([email, password].some((item) => !item)) {
      throw new APIErrors({
        statusCode: 400,
        message: "Please enter both email and password",
      });
    }

    if (!this.emailRegex.test(email)) {
      throw new APIErrors({
        statusCode: 400,
        message: "Invalid email format",
      });
    }

    if (this.sqlInjectionRegex.test(password)) {
      throw new APIErrors({
        statusCode: 400,
        message: "Invalid password format",
      });
    }

    const userDetails = await User.findOne({
      email,
    });

    if (!userDetails) {
      throw new APIErrors({
        statusCode: 404,
        message: "No user with this email exists with us",
      });
    }

    const isPasswordCorrect = await (userDetails as UserDTO)?.checkPassword(
      password
    );

    if (!isPasswordCorrect) {
      throw new APIErrors({
        statusCode: 401,
        message: "Unauthorised Password!",
      });
    }

    try {
      const { accessToken, refreshToken } =
        this.generateAccesAndRefreshToken(userDetails);

      res.status(200).json({
        statusCode: 200,
        message: "User logged in successfully",
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      throw new APIErrors({
        statusCode: 500,
        message: "Failed to generate token.",
      });
    }
  }
}
