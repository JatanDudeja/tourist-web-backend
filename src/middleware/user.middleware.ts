import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { APIErrors } from "../utils/apiErrors.js";
import { GlobalRequestDTO, JWTResDTO } from "../types/user.types.js";

export async function checkJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req?.headers?.["authorization"] || req?.body?.refreshToken;

  let refreshTokenSecretKey;
  try {
    refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET as string;
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
    return;
  }

  const refreshToken = authorization?.split(" ")[1];
  const decordRefreshToken: JWTResDTO = jwt.verify(
    refreshToken,
    refreshTokenSecretKey
  ) as JWTResDTO;

  if (!decordRefreshToken || Object?.keys(decordRefreshToken)?.length === 0) {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
    });
    return;
  }

  const userID = decordRefreshToken?.id;
  const userDetails = await User.findById(userID);

  if (!userDetails || refreshToken !== userDetails?.refreshToken) {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
    });
    return;
  }

  (req as GlobalRequestDTO).userID = userID;

  next();
}
