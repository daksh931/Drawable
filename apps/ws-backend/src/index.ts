import { WebSocketServer ,WebSocket } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config"
import jwt, { decode, JwtPayload } from "jsonwebtoken"
import {prismaClient} from "@repo/db/client" 
const wss = new WebSocketServer({ port: 8080 })

interface Users {
    userId: string,
    ws: WebSocket,
    rooms: string[]
}

const users: Users[] = []
function checkUser(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded === "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    } catch (error) {
        return null;
    }
    return null;
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        console.log("url not found!")
        return;
    }
    const queryPrams = new URLSearchParams(url.split('?')[1])
    const token = queryPrams.get('token') || "";
    const userId = checkUser(token);
    if (userId == null) {
        ws.close()
        return null;
    }
    users.push({
        userId: userId,
        ws,
        rooms:[]
    })
    console.log(users)
    ws.on('message', async function message(data) {
        let parseData;
        
        if (typeof data !== "string") {
            parseData = JSON.parse(data.toString());
        }
        else {
            parseData = JSON.parse(data)
        }
        
        if (parseData.type == "join_room") {
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parseData.roomId);
        }
        
        console.log(users)
        if(parseData.type== "leave_room"){
            const user = users.find(x=> x.ws === ws)
             if (!user) {
                return;
            }
            user.rooms = user?.rooms.filter(x=> x === parseData.roomId);
        }

        if(parseData.type === "chat"){
            // console.log("data from socket in chat/message format",parseData, "           --        ", parseData.data)
            const message = parseData.message;
            const roomId = parseData.roomId;
            
           

            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        messages:message,
                        roomId
                    }))
                }
            })
        }

    })  



})

