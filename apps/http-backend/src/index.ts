import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import cors from "cors";
import { CreateUserSchema, signInSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client"
import jwt from "jsonwebtoken"
import { middleware } from "./Middleware";
import { Response } from "express";
import { AuthRequest } from "./Middleware";

const app = express()


app.use(express.json())

app.use(cors({
  origin: 'http://localhost:3000', // or "*" if testing locally
  credentials: true
}));

app.post("/signup", async (req, res) => {
    console.log(req.body)
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error)
        res.json({ message: "Incorrect Inputs" })
        return;
    }


    try {

        const existingUser = await prismaClient.user.findFirst({ where: { email: parsedData.data.email } })
        if (existingUser) {
            res.status(400).json({ message: "User Already Exist" })
            return
        }
        const newuser = await prismaClient.user.create({
            data: {
                name: parsedData.data?.name,
                email: parsedData.data.email,
                password: parsedData.data?.password
            }
        })

        res.json({
            userId: newuser.id
        })

    } catch (error) {
        res.status(400).json({
            message: "User Already exist or Something went wrong"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = signInSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ message: "Incorrect Inputs" })
        return
    }

    const user = await prismaClient.user.findFirst({ where: { email: parsedData.data.email } })
    if (!user) {
        res.status(403).json({ message: "not authorized" });
        return
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET)

    res.json({ token })
})

app.post("/room", middleware, async (req: AuthRequest, res: Response) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ message: "Invalid Inputs" })
        return;
    }

    const userId = req.userId
    if (!userId) {
         res.status(401).json({ message: "Not authorized" });
         return
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch (error) {
        res.status(411).json({message:"Room already exist"})
    }

})

app.get("/chats/:roomId",middleware, async (req,res)=> {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);

        const messages = await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            },
            take:100
        })

        res.json({
            messages
        })

    } catch (error) {
        res.json({messages:[]})
    }
})



app.listen(3001)