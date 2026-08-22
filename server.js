import { Server } from "https://deno.land/x/socket_io@0.2.1/mod.ts"
import { serveDir } from "jsr:@std/http/file-server"
import { userIO } from "./deps/user.js"

const io = new Server()

io.on("connection", socket => [
  userIO(socket),
])

Deno.serve(
  {port: 3000},
  io.handler(req => serveDir(req, {
    fsRoot: "./public", showIndex: true
  }))
)