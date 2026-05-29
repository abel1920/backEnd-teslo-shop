import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
    [socketId: string]: {
        socket: Socket,
        user: User
    }
}
@Injectable()
export class MessagesWsService {
    private connectedClients: ConnectedClients = {}
    private readonly logger = new Logger('MessagesWsService')

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }


    //Registrar al cliente
    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId })
        
        if (!user) {
            this.logger.warn(`Intento de conexión con usuario no encontrado: ${userId}`)
            throw new NotFoundException('Usuario no encontrado')
        }
        
        if (!user.isActive) {
            this.logger.warn(`Intento de conexión con usuario inactivo: ${userId}`)
            throw new BadRequestException('Usuario inactivo')
        }

        this.checkUserConnection(user)

        this.connectedClients[client.id] = {
            socket: client,
            user
        }
        
        this.logger.log(`Cliente registrado: ${client.id} para usuario ${user.id}`)
    }

    //Eliminar al cliente
    remove(clientId: string) {
        const client = this.connectedClients[clientId]
        if (client) {
            this.logger.log(`Eliminando cliente: ${clientId}`)
            delete this.connectedClients[clientId]
        }
    }

    getConnectClients(): string[] {
        return Object.keys(this.connectedClients)
    }

    /**
     * Obtener el nombre completo del usuario conectado
     * @param socketId ID del socket
     * @throws NotFoundException si el socket no existe
     */
    getUserFullName(socketId: string): string {
        const client = this.connectedClients[socketId]
        
        if (!client) {
            this.logger.warn(`Socket no encontrado: ${socketId}`)
            throw new NotFoundException(`Socket con ID ${socketId} no encontrado`)
        }
        
        return client.user.fullName
    }

    private checkUserConnection(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId]
            
            if (connectedClient.user.id === user.id) {
                this.logger.log(`Desconectando sesión anterior del usuario ${user.id} (Socket: ${clientId})`)
                connectedClient.socket.disconnect(true)
                break
            }
        }
    }
}
