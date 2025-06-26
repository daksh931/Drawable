import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import cors from "cors";
import { CreateUserSchema, signInSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client"
import jwt from "jsonwebtoken"


const app = express()

app.use(express.json())
app.use(cors())

app.post("/singup", async (req, res) => {
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
                email: parsedData.data?.email,
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

    const user = await prismaClient.user.findOne({ where: { email: parsedData.data.email } })
    if (!user) {
        res.status(403).json({ message: "not authorized" });
        return
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET)

    res.json({ token })
})

app.listen(3001)