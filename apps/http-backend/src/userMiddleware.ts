import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function userMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    // 1. Check if the header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ msg: "Authorization header missing or invalid" });
    }

    // 2. Extract the token from the "Bearer <token>" string
    const token = authHeader.split(' ')[1];

    try {
        // 3. Use a try...catch block to handle invalid tokens
        //@ts-ignore
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !(decoded as any).userId) {
            return res.status(403).json({ msg: "Invalid token" });
        }
        
        //@ts-ignore
        req.userId = (decoded as any).userId;
        next();
    } catch (error) {
        // This will catch expired tokens or other verification errors
        return res.status(403).json({ msg: "Token verification failed" });
    }
}
