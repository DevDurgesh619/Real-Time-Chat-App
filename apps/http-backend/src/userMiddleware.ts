import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
export function userMiddleware(req:Request,res:Response,next:NextFunction){
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string,JWT_SECRET)
    if(!decoded){
        return res.status(400).json({msg:"you are not logged in"})
    }
    //@ts-ignore
    req.userId = decoded.userId;
    next();
}