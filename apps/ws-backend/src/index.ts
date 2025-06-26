import { WebSocketServer } from "ws";
import {JWT_SECRET} from "@repo/backend-common/config"
import jwt, { JwtPayload } from "jsonwebtoken"

const wss = new WebSocketServer({ port: 8080 })

// wss.on('connection',function connection(ws){

// interface User{
//     ws: WebSocket,
//     rooms: string[],
//     userId : string
// }

//     const users : User[] = []
//     ws.on('message', function message(data){
//         ws.send('pong')
//     })
// });


wss.on('connection', function(ws,request){
    const url = request.url;

    if(!url){
        console.log("url not found!")
        return
    }

    const queryPrams = new URLSearchParams(url.split('1')[1])
    const token = queryPrams.get('token') || "";

    const decoded = jwt.verify(token,JWT_SECRET)

    if(!decoded || !(decoded as JwtPayload).userId){
        ws.close();
        return;
    }

    ws.on('message', function message(data){
        ws.send('pong')
    })



})

