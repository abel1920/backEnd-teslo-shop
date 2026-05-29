import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  constructor(private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }


  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.autentication as string
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect()
      return
    }
    //console.log('cliente conectado', client.id)

    //Cliente se conecta
    this.wss.emit('clients-updated', this.messagesWsService.getConnectClients())
  }
  handleDisconnect(client: Socket) {
    //console.log('Cliente Desconectado.', client.id);
    this.messagesWsService.remove(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectClients())

  }

  @SubscribeMessage('send-message')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {

    //!Emite unicamente al cliente
    /*     client.emit('message-server', {
          fullName: 'Jordan',
          message: payload.message
        }) */

    //!Emite a todos MENOS,al cliente inicial
    /*   client.broadcast.emit('message-server', {
       fullName: 'Jordan',
       message: payload.message
     }) */

    //!Emite a todos
    this.wss.emit('message-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message
    })
  }
}
