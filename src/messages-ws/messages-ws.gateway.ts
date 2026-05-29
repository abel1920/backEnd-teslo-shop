import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';
import { Logger, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  private readonly logger = new Logger('MessagesWsGateway')

  constructor(private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }


  async handleConnection(client: Socket, ...args: any[]) {
    // Corregir typo: 'autentication' → 'authentication'
    const token = client.handshake.headers.authorization as string
    
    // Validar que el token existe
    if (!token) {
      this.logger.warn(`Cliente ${client.id} intentó conectar sin token`)
      client.disconnect()
      return
    }

    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
      this.logger.log(`Usuario ${payload.id} conectado (Socket: ${client.id})`)
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`)
      client.disconnect()
      return
    }

    // Cliente se conecta - emitir lista actualizada
    this.wss.emit('clients-updated', this.messagesWsService.getConnectClients())
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.remove(client.id)
    this.logger.log(`Cliente desconectado: ${client.id}`)
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
