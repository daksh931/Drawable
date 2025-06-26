import {z} from "zod";

 export const CreateUserSchema = z.object({
    name : z.string().min(3).max(20),
    email : z.string().min(5),
    password: z.string(),
 })


 export const signInSchema = z.object({
    email : z.string().min(5),
    password: z.string(),
 })

 export const CreateRoomSchema = z.object({
    name : z.string().min(3).max(20)
 })