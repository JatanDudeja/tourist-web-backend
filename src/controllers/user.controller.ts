import { Request, Response } from "express";
import User from "../models/user.model.js";
import { APIErrors } from "../utils/apiErrors.js";

export class UsersController {
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

      await user.save();
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
}
