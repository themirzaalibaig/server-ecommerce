import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { Request, Response } from 'express';
import { createValidationError, ResponseUtil } from '../utils/response';
import { generateToken } from '../config/jwt';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, phone, password, image } = req.body;

    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      ResponseUtil.badRequest(res, 'Email already exists', [
        createValidationError('email', 'Email already exists'),
      ]);
    }

    const phoneExists = await UserModel.findOne({ phone });
    if (phoneExists) {
      ResponseUtil.badRequest(res, 'Phone number already exists', [
        createValidationError('phone', 'Phone number already exists'),
      ]);
    }

    const user = await UserModel.create({
      username,
      email,
      phone,
      password,
      image,
    });
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });
    ResponseUtil.success(res, { user, token }, 'User created successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Must select password explicitly since it has select: false in model
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      ResponseUtil.badRequest(res, 'Invalid email or password', [
        createValidationError('email', 'Invalid credentials'),
      ]);
      return;
    }

    // Use the comparePassword method from the model
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      ResponseUtil.badRequest(res, 'Invalid email or password', [
        createValidationError('password', 'Invalid credentials'),
      ]);
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    
    ResponseUtil.success(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};
