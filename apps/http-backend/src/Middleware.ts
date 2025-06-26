import {Request,Response,NextFunction} from "express"
import {JWT_SECRET} from "@repo/backend-common/config"
import jwt from "jsonwebtoken"

interface TokenPayload {
  userId: string;
  email: string;
}
export interface AuthRequest extends Request {
  userId?: string;
}
export function middleware(req:AuthRequest, res:Response, next:NextFunction){
    const token = req.headers["authorization"] ?? ""

    const decoded = jwt.verify(token,JWT_SECRET) as TokenPayload

    if(decoded){
        req.userId = decoded.userId;
        next();
    }
    else{
          res.status(403).json({
            message: "Unauthorized"
        })
    }

}
