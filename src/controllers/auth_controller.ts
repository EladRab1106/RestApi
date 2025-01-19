/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request, NextFunction } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type Payload = {
  _id: string;
};

const generateTokens = (
  id: string
): { accessToken: string; refreshToken: string } | null => {
  const random = Math.floor(Math.random() * 1000000);
  if (!process.env.JWT_SECRET) {
    return null;
  }
  const accessToken = jwt.sign(
    { _id: id, random: random },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  const refreshToken = jwt.sign(
    { _id: id, random: random },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
  return { accessToken, refreshToken };
};

const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

const verifyRefreshToken = async (
  refreshToken: string,
  res: Response
): Promise<any | null> => {
  if (!process.env.JWT_SECRET) {
    res.status(500).send("Server error: Missing JWT_SECRET");
    return null;
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET) as Payload;
    const user = await userModel.findById(payload._id);
    if (!user) {
      res.status(404).send("User not found");
      return null;
    }

    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
      user.refreshToken = [];
      res.status(401).send("Access Denied");
      return null;
    }
    return user;
  } catch (err) {
    if (err) {
      res.status(401).send("Access Denied");
    }
    return null;
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(400).send("wrong email or password1");
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).send("wrong email or password2");
      return;
    }
    const tokens = generateTokens(user._id);
    if (!tokens) {
      res.status(500).send("server error");
      return;
    }

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      _id: user._id,
      email: user.email,
      refreshToken: tokens.refreshToken,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("Bad request");
    return;
  }
  const user = await verifyRefreshToken(refreshToken, res);
  if (!user) {
    res.status(401).send("Access Denied");
    return;
  }
  if (!user.refreshToken) {
    res.status(200).send("Logged out successfully");
    return;
  }
  user.refreshToken = user.refreshToken.filter(
    (t: string) => t !== refreshToken
  );
  await user.save();

  res.status(200).send("Logged out successfully");
};

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("Bad request");
    return;
  }

  const user = await verifyRefreshToken(refreshToken, res);
  if (!user) {
    return;
  }
  const newTokens = generateTokens(user._id);
  if (!newTokens) {
    user.refreshToken = [];
    await user.save();
    res.status(500).send("Server error");
    return;
  }
  user.refreshToken = user.refreshToken.filter(
    (t: string) => t !== refreshToken
  );
  user.refreshToken.push(newTokens.refreshToken);
  await user.save();

  res.status(200).send({
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    res.status(401).send("Access Denied");
    return;
  }
  if (!process.env.JWT_SECRET) {
    res.status(500).send("server error");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      res.status(401).send("Access Denied");
      return;
    }
    req.params.userId = (payload as Payload)._id;
    next();
  });
};

export default { register, login, logout, refresh };
